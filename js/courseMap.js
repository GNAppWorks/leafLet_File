//initialize map
var map = new L.Map(
	'map', 
	{
		center: new L.LatLng(38.3456, -75.6058),
		zoom: 12,
        trackResize: true
	}
);

//load base layer
var url = 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
L.tileLayer(url, {maxZoom: 19}).addTo(map);

var route = getUrlVars()["route"];

var routeGeoJSON;

var locateOptions = {
    watch: true,
    setView: true,
    maxZoom: 16
};

//replaces setView method and sets to detected location
map.locate(locateOptions);

var circle;

// function for finding Geolocation and adding a marker to the map
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    if(circle != undefined){
        map.removeLayer(circle);
    }

    circle = L.circle(e.latlng, radius).addTo(map);

    //This function will add the route to the nearest rest stop to the map. We're going to want to make this it's own button rather than calling it whenever the location is found.
    var routeToNearestRestStop = new Route(routeGeoJSON, route, e.latlng.lng, e.latlng.lat);
    L.geoJson(routeToNearestRestStop.getRoute(), {style: {color: "red"}}).addTo(map);
    
    //This next line is for testing purposes, but it fires so frequently that it's really annoying.
    //alert("Distance to nearest rest stop: " + routeToNearestRestStop.getGeoJSONLineDistance() + " Miles");
    var speedText = '';
    e.speed = 20;
    //Speed isn't always defined, it depends on the device, connection method, etc. We only add it if we're given a number for it that makes sense.
    if(e.speed != undefined){
        //e.speed is in m/s so we have to convert to mph
        speedText = '<div class="spacer"></div><h3>Speed: </h3><h3 class="red-text">' + Math.round(e.speed*2.23694) + ' mph</h3><div class="spacer"></div>';
    }
    $('.speed-control').html(speedText);
    $('#distance').html('<h2>Nearest Rest Stop - ' + routeToNearestRestStop.getGeoJSONLineDistance() + ' miles</h2>');
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

//map.addControl(new L.Control.Gps());

var SpeedControl = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'speed-control');
        return container;
    }
});
map.addControl(new SpeedControl());

map.addControl(new (L.Control.extend({
    options: { position: 'bottomright' },
    ButtonPressCallback: function(){
        if(locateOptions.setView == true){
            map.stopLocate();
            locateOptions.setView = false;
            map.locate(locateOptions);
            $('.center-gps-button-interior').html("<button>Resume</button>");
        }
        else{
            map.stopLocate();
            locateOptions.setView = true;
            map.locate(locateOptions);
            $('.center-gps-button-interior').html("<button>Explore</button>");
        }
    },
    onAdd: function (map) {
        controlDiv = L.DomUtil.create('div', 'center-gps-button');
        L.DomEvent
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', this.ButtonPressCallback);

        // Set CSS for the control border
        var controlUI = L.DomUtil.create('div', 'center-gps-button-border', controlDiv);
        controlUI.title = 'Explore';

        // Set CSS for the control interior
        var controlText = L.DomUtil.create('div', 'center-gps-button-interior', controlUI);
        controlText.innerHTML = '<button>Explore</button>';

        return controlDiv;
    }
})));
