#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

const char *ssid = "Funkloch mobil";
const char *password = "qwertyuiop";

const char* host = "192.168.43.91";
const char* epid = "d91c1898-82d3-413a-85fa-a4b81d956146";
const char* uuid = "7b047df7-a28b-47af-b918-652ac57d8749";

MDNSResponder mdns;

ESP8266WebServer server ( 80 );

const int led = D5;

void handleRoot() {
	digitalWrite ( led, 1 );
	server.send ( 200, "text/html", "sup" );
	digitalWrite ( led, 0 );
}

void procedureNotFound() {
	digitalWrite ( led, 1 );
	String message = "File Not Found\n\n";
	message += "URI: ";
	message += server.uri();
	message += "\nMethod: ";
	message += ( server.method() == HTTP_GET ) ? "GET" : "POST";
	message += "\nArguments: ";
	message += server.args();
	message += "\n";

	for ( uint8_t i = 0; i < server.args(); i++ ) {
		message += " " + server.argName ( i ) + ": " + server.arg ( i ) + "\n";
	}

	server.send ( 404, "text/plain", message );
	digitalWrite ( led, 0 );
}

void setup ( void ) {
	pinMode ( led, OUTPUT );
	digitalWrite ( led, 0 );
	Serial.begin ( 115200 );
	WiFi.begin ( ssid, password );
	Serial.println ( "" );

	// Wait for connection
	while ( WiFi.status() != WL_CONNECTED ) {
		delay ( 500 );
		Serial.print ( "." );
	}

	Serial.println ( "" );
	Serial.print ( "Connected to " );
	Serial.println ( ssid );
	Serial.print ( "IP address: " );
	Serial.println ( WiFi.localIP() );
  Serial.println("Registering Node");
  registerNode();

	if ( mdns.begin ( "esp8266", WiFi.localIP() ) ) {
		Serial.println ( "MDNS responder started" );
	}

  server.on("/turnon", []() {
    digitalWrite(led, 1);
    server.send ( 200, "text/html", server.arg("val"));
    update();
  });

  server.on("/turnoff", []() {
    digitalWrite(led, 0);
    server.send ( 200, "text/html", server.arg("val"));
    update();
  });

  server.on("/forceupdate", []() {
    update();
    server.send ( 200, "text/html", "OK");
  });

	server.on ( "/", handleRoot );
  server.on ( "/ping", ping );
  server.on("/doreg", registerNode);
	server.onNotFound ( procedureNotFound );
	server.begin();
	Serial.println ( "HTTP server started" );
}

void update() {
  Serial.println("will update");
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  String url = "/node/update/";
  url += uuid;

  Serial.print("sending pong");
  Serial.println(url);

  int val = digitalRead(led);
  
  String PostData = "{\"0\":";
  if(val == 0) {
    PostData += "\"true\"";
  } else {
    PostData += "\"false\"";
  }
  PostData += "}";

  client.print("POST ");
  client.print(url);
  client.println(" HTTP/1.1");
  client.print("Host: ");
  client.println(host);
  client.println("Content-Type: application/json");
  client.println("User-Agent: Arduino/1.0");
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(PostData.length());
  client.println();
  client.println(PostData);

//  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
//               "Host: " + host + "\r\n" + 
//               "Connection: close\r\n\r\n");
  delay(10);

  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  
}

void ping() {
  Serial.println("got ping");
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  String url = "/node/pong/";
  url += uuid;

  Serial.print("sending pong");
  Serial.println(url);

  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  delay(10);

  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
}

void registerNode() {
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    //digitalWrite(led, 1);
    return;
  }
  String url = "/node/register/";
  url += epid;
  url += "/";
  url += uuid;

  Serial.print("Requesting URL: ");
  Serial.println(url);

  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  delay(10);

  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }

  Serial.println();
  Serial.println("closing connection");
  update();
}

void loop ( void ) {
	mdns.update();
	server.handleClient();
}
