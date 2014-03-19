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
		L.geoJson(route).addTo(map);
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
