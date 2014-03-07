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

//add code for route
	// read in the route from server
	// put GeoJSON objects in ArrayList
	// Leaflet polyline function that will read ArrayList and plot the line
	// add markers for the points denoted "rest stop" (build in Leaflet function)

//replaces setView method and sets to detected location
map.locate({
	setView: true,
	maxZoom: 16
});