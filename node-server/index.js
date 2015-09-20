var rpc = function(str) {
	console.log("RPC")
	console.log(str)
	console.log("/RPC")
}

var express = require('express')
var bodyParser = require('body-parser')
var _ = require('lodash')
var get_ip = require('ipware')().get_ip
var request = require('request')
var products = require('./productstorage')

var app = express()

var http = require('http').Server(app)
var io = require('socket.io')(http)

var nodes = []

/**
 * execute method belonging to state
 */
var executeStateChange = function(event) {
	var node = _.find(nodes, {'uuid':event.uuid})
	if(node) {
		//get product methods
		var epid = node.epid
		var product = products[epid]

		var method = event.id
		var val = event.state

		console.log("whishes to perform", method, "with val", val)

		if(product.methods[method]) {
			var uri = product.methods[method](val)
			console.log("uri is:", uri)
			if(uri) {
				//call the node
				request("http://"+node.ip+uri, function (error, response, body) {
				    if (!error && response.statusCode == 200) {
				        console.log(body) // Show the HTML for the Modulus homepage.
				    } else {
				    	console.log(error)
				    }
				})
			}
		} else {
			console.log("no such method")
		}
	} else {
		console.log('no fitting node found')
	}
}

io.on('connection', function(socket) {
	console.log('someone connected')
	socket.emit('devices', nodes)

	//app changed a state
	socket.on('statechange', function(data) {
		console.dir(data)
		console.log("received statechange from",data.uuid,"with id",data.id,"to",data.state)
		executeStateChange(data)
	})
})

io.on('statechange', function(socket) {
	console.log("received statechange from")
})

app.use(bodyParser.json())
app.use(function(req, res, next) {
    var ip_info = get_ip(req);
    next();
});

app.get('/', function(req, res) {
	res.send('Hello World')
})

/**
 * return all registered devices
 */
app.get('/client/getdevices', function(req, res) {
	res.json(nodes)
})

//DEPRECATED
app.get('/client/getstatus/:uuid', function(req, res) {
	var uuid = req.params.uuid

	var node = _.find(nodes, {'uuid':uuid})

	if(node) {
		res.json(node.states)
	}
	res.sendStatus(500)
})

app.get('/node/pong/:uuid', function(req, res) {

})

/**
 * register new node
 */
app.get('/node/register/:epid/:uuid', function(req, res) {
	var ip = _.trimLeft(req.clientIp, "::ffff:")
	console.log("Node wants to register. IP:", ip)

	//do we knopw the product
	var epid = req.params.epid
	var uuid = req.params.uuid
	if(products[epid]) {
		//maybe reconnect
		_.remove(nodes, function(n) {
			return n.uuid == uuid;
		})
		console.log("Node is of known type")

		//copy attributes
		var node = _.cloneDeep(products[epid].config);
		console.log(node.states)
		node.epid = epid
		node.uuid = uuid
		node.ip = ip
		node.t = Date.now()/1000

		nodes.push(node)
		io.emit('devices', nodes)
	} else {
		console.log("Node is of UNKNOWN type!")
	}

	console.log(req.params.uuid)
	res.status(200).send("top");
})

/**
 * node sends update
 */
app.post('/node/update/:uuid', function(req, res) {
	var uuid = req.params.uuid
	var node = _.find(nodes, {'uuid':uuid})
	console.log("received update")
	if(node) {
		console.log(req.body)
		node.states = req.body
		io.emit('statechange', {'uuid':uuid, states: node.states})
	} else {
		console("update is from unknown node")
	}
})

var server = http.listen(3000, function() {
	console.log('*', 'express server at', server.address().address, server.address().port)
})
