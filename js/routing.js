function Route(routeGeoJSON, route, lon, lat){
	this.routeGeoJSON = routeGeoJSON;
	this.lon = lon;
	this.lat = lat;
	this.route = route;
	this.closestPointOnLine;
	this.routeIndex;

	this.getRoute = function(){
		
		return this.routeToNearestRestStop;
	};	

	this.snapToLine = function(){
		var lknn = leafletKnn(this.routeGeoJSON);
		var closestPointOnLineUnformatted = lknn.nearest([this.lon, this.lat], 1, 500);
		return new Array(closestPointOnLineUnformatted[0].lon, closestPointOnLineUnformatted[0].lat);
	};

	this.findRouteIndex = function(){
		for(var i = 0; i < this.route.features[0].geometry.coordinates.length; i++){
			if((this.route.features[0].geometry.coordinates[i][0] == this.closestPointOnLine[0]) && (this.route.features[0].geometry.coordinates[i][1] == this.closestPointOnLine[1])){
				return i;
			}
		}
		return -1;
	};

	this.buildRoute = function(){
		var routeToNearestRestStop = {
    		"type": "Feature",
			"properties": {},
			"geometry": {
				"type": "LineString",
				"coordinates": []
			}
		}
		routeToNearestRestStop.geometry.coordinates = this.route.features[0].geometry.coordinates.slice(this.routeIndex);
		return routeToNearestRestStop;
	};

	this.getGeoJSONLineDistance = function(){

		function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		  	var R = 6371; // Radius of the earth in km
		  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
		  	var dLon = deg2rad(lon2-lon1); 
		  	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
		  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  	var d = R * c; // Distance in km
		  	return d;
		}

		function deg2rad(deg) {
		  return deg * (Math.PI/180)
		}

		var distance = 0;
		for(var i = 0; i < this.routeToNearestRestStop.geometry.coordinates.length-1; i++){
			distance += getDistanceFromLatLonInKm(this.routeToNearestRestStop.geometry.coordinates[i][1], this.routeToNearestRestStop.geometry.coordinates[i][0], this.routeToNearestRestStop.geometry.coordinates[i+1][1], this.routeToNearestRestStop.geometry.coordinates[i+1][0]);
		}
		return (0.621371 * distance).toFixed(2);
	};


	this.closestPointOnLine = this.snapToLine();
	this.routeIndex = this.findRouteIndex();
	this.routeToNearestRestStop = this.buildRoute();
}