//IMPORTANT NOTE - these are string values, not numbers or booleans. This is to make URL parsing easier.
//Default settings, can be overridden by passing values via the URL
var settings = {
    route: "0",
    speed: "true",
    vendors: "true",
    distance: "true"
};

//Calls a function somewhere below to get the URL arguments and assign them to args (a JSON object)
var args = getUrlVars();

//Changes the default settings if there was a value passed for that setting via the URL
for(var key in settings){
    if(args[key] != undefined){
        settings[key] = args[key];
    }
}

//Makes the top bar invisible if the distance bar setting is set to off
if(settings.distance == "false"){
    $("#distance").hide();

    //By default we assume the distance bar is going to be there, so we set a top margin on the +/- button group so it looks good. We need to alter it if the distance bar isn't going to be there.
    //It's in #(document).ready() because since Leaflet adds this class dynamically we have to wait for the object to load into the DOM before we can alter it
    $(document).ready(function() {
        $(".leaflet-top").css("margin-top", "0px");
    });
}

//initialize map
var map = new L.Map('map', 
	{
		center: new L.LatLng(38.3456, -75.6058),
		zoom: 12,
        trackResize: true
	}
);

//load base layer
var url = 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
L.tileLayer(url, {maxZoom: 19}).addTo(map);

var routeGeoJSON;

var locateOptions = {
    watch: true,
    setView: true,
    maxZoom: 16
};

//replaces setView method and sets to detected location

var circle;
var hasGottenSpeed = false;

if(settings.vendors == "true"){
    function onEachFeature(feature, layer) {
        if(feature.properties){
            layer.bindPopup("<h1>"+feature.properties.name+"</h1><h3>"+feature.properties.address+"</h3><h4>"+feature.properties.description+"</h4>");
        }
    }

    $.get('http://oxford.esrgc.org/maps/seagullcentury/data/vendors.geojson', 
        function(data){
            L.geoJson(JSON.parse(data), {onEachFeature: onEachFeature}).addTo(map);
        }
    );

}

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
    
    //This next line is for testing purposes, but it fires so frequently that it's really annoying so I'm commenting it out.
    //alert("Distance to nearest rest stop: " + routeToNearestRestStop.getGeoJSONLineDistance() + " Miles");
    
    var speedText = '';
    //Speed isn't always defined, it depends on the device, connection method, etc. We only add it if we're given a number for it that makes sense.
    //If we get speed back in the e object and the speed setting is marked as true we go into this statement
    if((e.speed != undefined) && (settings.speed == "true")){
        console.log("here");
        //hasGottenSpeed (defined outside of the scope of this function) will only be set to true if 1)the phone has the capability to recieve a speed value, which we know because
        //the phone has previously given us an e.speed value, and 2)if settings.speed is set to true. It helps us out with our else if statement
        hasGottenSpeed = true;
        speedText = setSpeedText(e.speed);
    }
    //We'll go into this statement if e.speed was undefined but we've gotten the speed from a previous e object (so the phone is capable of giving it).
    //This behavior occurs sometimes when the speed-capable phone isn't moving. 
    else if ((e.speed == undefined) && (hasGottenSpeed == true)){
        console.log("here1");
        speedText = setSpeedText(0);
    }
    //If we hit this else statement, it means that the phone didn't and hasn't ever returned a speed value. If this happens, we have behavior that
    //set speedText to be just '', which means it won't show up on the screen.
    else{
        speedText = setSpeedText(null);
    }
    $('.speed-control').html(speedText);
    $('#distance').html('<h2>Nearest Rest Stop - ' + routeToNearestRestStop.getGeoJSONLineDistance() + ' miles</h2>');
}

function setSpeedText(speed){
    //e.speed is in m/s so we have to convert to mph
    if(speed != null){
        return '<div class="spacer"></div><h3>Speed: </h3><h3 class="red-text">' + Math.round(speed*2.23694) + ' mph</h3><div class="spacer"></div>';
    }
    else{
        return '';
    }
}

map.on('locationfound', onLocationFound);

// Function to display an Error on location fail
function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

// load route from server
$.getScript('http://apps.esrgc.org/maps/seagullcentury/data/route' + settings.route + '.js', 
	function(){
		routeGeoJSON = L.geoJson(route).addTo(map);
        map.locate(locateOptions);
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
    if(vars==undefined){
        vars = defaults.hash[0];
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
            $('.center-gps-button-interior').html("<img src='style/img/TrackingOff.png'>");
        }
        else{
            map.stopLocate();
            locateOptions.setView = true;
            map.locate(locateOptions);
            $('.center-gps-button-interior').html("<img src='style/img/TrackingOn.png'>");
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
        controlText.innerHTML = "<img src='style/img/TrackingOff.png'>";

        return controlDiv;
    }
})));
