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
L.tileLayer(url, {maxZoom: 18}).addTo(map);

// load route from server
$.getScript("http://apps.esrgc.org/maps/seagullcentury/route0.js", 
	function(){
		L.geoJson(route).addTo(map);
	}
);

//replaces setView method and sets to detected location
map.locate({
	setView: true,
	maxZoom: 17
});