app.controller('listCtrl', function($scope, $rootScope, socket) {

    $scope.data = []

    //get data and updates
    socket.on('connect', function() {
        console.log("connnnnnnected to socketIo")
    })

    socket.on('devices', function(data) {
        $scope.data = data
        $scope.states = data.states
        console.log("got data")
        console.log($scope.data[0].states[0])
    })

    socket.on('statechange', function(data) {

        var s = _.find($scope.data, {'uuid':data.uuid}).states
        _.forIn(s, function(value, key) {
            if(value != data.states[key]) {
                value = data.states[key]
            }
        })
        console.log(s[0], data.states[0])
    })

    // we made changes, send to server
	$scope.changed = function(device, id) {
        console.log(id)
		socket.emit('statechange', {'uuid': device.uuid, 'id': id, 'state': device.states[id]})
	}

    // helper for control type
	$scope.isControl = function(left, right) {
		return left == right
	}

    $scope.query = ""

    // scan found node and emits event were listening to
    $rootScope.$on('setQuery', function(event, data) {
        console.log("got data:", data)
        $scope.query = data
    })

    //toggle header helper
	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
		  $scope.shownGroup = null;
		} else {
		  $scope.shownGroup = group;
		}
	};
	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

})
