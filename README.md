Seagull Century Leaflet Files
=============
Upload all Leaflet files to this repository in your own branch. When you want to put your changes up on the main server submit a pull request and I'll put it up. Do as much work as you can via localhost to avoid the delay between when you submit the pull request and when I put it up.

Data File Design Specification and Integration Method
=============
This is a step by step guide for what to do with a route file to get it working in the application.
* First, you will receive some sort of a route file. It doesn't matter what the format is. Import it into ArcGIS. It should be some sort of a vector line.
* (NOTE - I haven't actually done this step because Arc doesn't work on Macs, so while it's theoretically correct you may run into issues). You're going to want to use the Densify tool to densify the route. We do this so that when the GPS snaps to the nearest point on the line for routing purposes, it'll snap to a nearby point if you're on a relatively straight portion of the route (which will, because it's straight, only contain a few points). Densify it by adding points every x meters (the more points there are the bigger the file will be and it'll take longer to do rest stop route calculations, but the more points there are the more accurate the starting points for rest stop route calculations will be, so try to balance these two concerns). The URL for this densify command is here. http://resources.arcgis.com/en/help/main/10.1/index.html#//001v00000003000000
* Now, open up QGIS. Export your line layer from ArcGIS as a shapefile and import it into QGIS. The rest of this will be done in QGIS, we had to use ArcGIS for the first part because QGIS's densify tool sucks (it doesn't do it every x meters, you just tell it how many points to insert into the line and it does it)).
	* If Right click your imported layer and toggle editing
	* Right click your imported layer and click Show Feature Count (if feature count is 1, don't worry about doing this next part)
	* View -> Select -> Select features by rectangle
	* Highlight the entire route
	* Edit -> Merge selected features
	* Use the defaults
	* Now the number next to your file name (the one denoting number of features) should be 1
* You should have the locations of the rest stops. Now we're going to add them into this file. A quick note about how this works - the route is currently one big line. We're going to split the line at each rest stop, so if there's x rest stops (not counting the start/end points) there should be x+1 line segments. We treat the end of each line segment as the location of a rest stop in the app.
* Edit -> Split features
* Find the part of the line closest to the rest stop
* Double click on both sides of the line, perpendicularly intersecting with the place you want the rest stop to be
* Right click, feature count should now be 2. If it's not, figure out why. If you have issues and you need to see the line better it helps to right click the layer, go to properties, go to style, and increase the width of the line to 3.
* Do this for every rest stop. You may have to do View -> Select -> Select features by rectangle and then highlight the entire route between splits or QGIS might throw an error.
* Once you've split everything, right click the layer and do a save as
* Select GeoJSON as the format and add a file name
* When it's done exporting, go to that file on your hard drive and open it in a text editor
* The first line should just be "{" (excluding quotes). Replace it with "var route = {" (excluding quotes)
* Change the file extension from .geojson to .js
* Rename it to route0.js for Assatague Century, route1.js for Snow Hill Century, route2.js for Princess Anne Metric
* If you know what you're doing with git and you have permissions, push this to the repository at github.com/gnappworks/seagullcentury-leaflet. If you don't know what that means or you don't have permissions, email the file to Frank, Tu, or Josh and they will do this. If you don't know who those people are, email the file to Dr. Lembo (ajlembo@salisbury.edu) and reference this guide, he'll make sure it gets to the right place.
* This file should be put on oxford.esrgc.org/maps/seagullcentury/data/ by an aforementioned developer with permissions. git pull will work as it's linked with the repository.