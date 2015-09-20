var products = [];

products["d91c1898-82d3-413a-85fa-a4b81d956146"] = {
		config: {
			name: "Lampe",
	        images: [
	            "MjQ4MjI2OTg1M19lNDdkZTU4NjJlX2I",
	            "SU1HXzIwMTUwOTA0XzE0MTM0Mw",
	            "Mjly"
	        ],
			controls: [
				{
					id: 0,
					label:"Optionen",
					method:"toggle",
					type:"toggle",
					default:true,
					states: {
						"An":true,
						"Aus":false
					}
				}
			],
			states: {
				"0": true
			}
		},

		methods: {
			"0": function(val) {
				if(val == true) {
					return "/turnon?pin=2"
				}
				if(val == false) {
					return "/turnoff?pin=2"
				}
			}
		}
	}

module.exports = products;
