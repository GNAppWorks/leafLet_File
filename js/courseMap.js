//initialize map
var map = new L.Map(
	'map', 
	{
		center: new L.LatLng(38.3456, -75.6058),
		zoom: 12
	}
);

//load base layer
var url = 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
L.tileLayer(url, {maxZoom: 15}).addTo(map);

var route = getUrlVars()["route"];

var routeGeoJSON;

//replaces setView method and sets to detected location
map.locate({
	setView: true,
	maxZoom: 15
});

// function for finding Geolocation and adding a marker to the map
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map);
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);

    //This function will add the route to the nearest rest stop to the map. We're going to want to make this it's own button rather than calling it whenever the location is found.
    var routeToNearestRestStop = new Route(routeGeoJSON, route, e.latlng.lng, e.latlng.lat);
    L.geoJson(routeToNearestRestStop.getRoute(), {style: {color: "red"}}).addTo(map);
    
    //This next line is for testing purposes, but it fires so frequently that it's really annoying.
    //alert("Distance to nearest rest stop: " + routeToNearestRestStop.getGeoJSONLineDistance() + " Miles");
    var speedText = '';
    console.log(e.speed);
    //Speed isn't always defined, it depends on the device, connection method, etc. We only add it if we're given a number for it that makes sense.
    if(e.speed != undefined){
        //e.speed is in m/s so we have to convert to mph
        speedText = 'Speed: ' + (e.speed*2.23694) + ' mph<br>';
    }
    $('.distance-control').html(speedText + 'Nearest Rest Stop: ' + routeToNearestRestStop.getGeoJSONLineDistance() + ' miles');
}

map.on('locationfound', onLocationFound);

// Function to display an Error on location fail
function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

// load route from server
$.getScript('http://apps.esrgc.org/maps/seagullcentury/data/route' + route + '.js', 
	function(){
		routeGeoJSON = L.geoJson(route).addTo(map);
    }
);



// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

map.addControl(new L.Control.Gps());

var DistanceControl = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'distance-control');
        return container;
    }
});
map.addControl(new DistanceControl());