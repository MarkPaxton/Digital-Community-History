
function windowResized()
{
	var newHeight = $(window).height() - $('#footer').height() - $('#header').height();
	$('#map').height(newHeight);
	//Manually correct for borders and margins that aren't counted in .height()
	// by looking at the difference between document height and window height to fine the discrepency
	var correctedHeight =  newHeight - ($(document).height() - $(window).height());
	$('#map').height(correctedHeight);
	
	$('#map').width($(window).width()-2);
}

function changeOpacity(byOpacity, layer) {
	var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
	setOpacity(minOpacity+maxOpacity-newOpacity, layer);
}

function setOpacity(toOpacity, layer) {
	var newOpacity = parseFloat(minOpacity+maxOpacity-toOpacity).toFixed(2);
	newOpacity = Math.min(maxOpacity, Math.max(minOpacity, newOpacity));
	OpenLayers.Util.getElement('opacity').value = newOpacity;
	$('#slider').slider('value', toOpacity);
	layer.setOpacity(newOpacity);
}


function onPopupClose(evt) {
    select.unselectAll();
}

function onFeatureSelect(event) {
	var feature = event.feature;
    selectedFeature = feature;
	var popup = new OpenLayers.Popup.FramedCloud("photo", 
		feature.geometry.getBounds().getCenterLonLat(),
		new OpenLayers.Size(200,200),
		"<h2>"+feature.attributes.name + "</h2>" + feature.attributes.description,
		null, true, onPopupClose
	);
	feature.popup = popup;
	map.addPopup(popup, true);
}

/*
function popUpFeature(feature)
{
   console.info('pop');
}*/

function onFeatureUnselect(event) {
    var feature = event.feature;
    if(feature.popup) {
        map.removePopup(feature.popup);
        feature.popup.destroy();
        delete feature.popup;
    }
}

function addMarker(p)
{
	var size = new OpenLayers.Size(18, 27);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('./images/pin.png', size,offset);
	var marker = new OpenLayers.Marker(p, icon);
	markersLayer.addMarker(marker);
}


function osm_getTileURL(bounds) {
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	var limit = Math.pow(2, z);

	if (y < 0 || y >= limit) {
		return OpenLayers.Util.getImagesLocation() + "404.png";
	} else {
		x = ((x % limit) + limit) % limit;
		return this.url + z + "/" + x + "/" + y + "." + this.type;
	}
}

function updatePosition(location)
{	
	var locationLL = new OpenLayers.LonLat(location.coords.longitude, location.coords.latitude);		

	// If the current location is out of bounds, then recentre from jubilee
	var imageBounds = new OpenLayers.Bounds( -1.158064,  52.946731, -1.139494, 52.958147);
	if(!imageBounds.containsLonLat(locationLL))
	{
		/* This section re-centres the navigation around market square from
		jubilee campus or wherever specified for testing purposes */ 

		// This is the alternative centre - where you actually are
		var alt_lon = -1.18494;
		var alt_lat = 52.95162;

		// This is the desired centre - where the map should show you are
		var desired_lon = -1.15050;
		var desired_lat = 52.95333;

		var corrected_lon = desired_lon + (location.coords.longitude - alt_lon);
		var corrected_lat = desired_lat + (location.coords.latitude - alt_lat);

		var lonLat = new OpenLayers.LonLat(corrected_lon, corrected_lat).transform(new OpenLayers.Projection("EPSG:4326"), map.projection);
		/* */
	}
	else
	{
		/* Normally, when in situ this would be used */
		var lonLat = new OpenLayers.LonLat(location.coords.longitude, location.coords.latitude).transform(new OpenLayers.Projection("EPSG:4326"), map.projection);
		/* */
	}
	addMarker(lonLat);
	console.log(lonLat);
	if(follow_location)
	{
		map.panTo(lonLat);
	}
	$('#location-text').html('Location:&nbsp;' + lonLat.lon + ', ' + lonLat.lat);
	//map.setCenter(lonLat);
}

function handleGetPositionErrors(error)  
{  
	/*
	switch(error.code)  
	{  
		case error.PERMISSION_DENIED: alert("Location information has not been provided.");  
		break;  

		case error.POSITION_UNAVAILABLE: alert("Current position is not available.");  
		break;  

		case error.TIMEOUT: alert("Could not get location information.");  
		break;  

		default: alert("Unknown error getting location information.");  
		break;
	} 
	*/
}  

function setFollowLocation(follow)
{
	if(follow)
	{
		$('#pin-on').show();
		$('#pin-off').hide();
		follow_location = true;
	}
	else
	{
		$('#pin-on').hide();
		$('#pin-off').show();
		follow_location = false;
	}
}

function mapMoved(event)
{
	//console.info(event.object.center);
	var count = 0;
	for(f in photos.features)
	{
		if(photos.features[f].atPoint(event.object.center, 20, 20))
		{				
			//console.info(photos.features[f]);
			//count++;
			console.info("popup");
			//photos.selectedFeatures.push(photos.features[f]);
			//popUpFeature(photos.features[f]);
			//select.select(photos.features[f]);
		}
	}
	//console.info(count);
}

