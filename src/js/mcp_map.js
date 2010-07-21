/**
 * Get query string parameters in a jquery like way
 */
$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});


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


function onFeatureUnselect(event) {
    var feature = event.feature;
    if(feature.popup) {
        map.removePopup(feature.popup);
        feature.popup.destroy();
        delete feature.popup;
    }
}

function onMapMoved(event)
{
	if(showPopups)
	{
		//console.info(event.object.center);
		var count = 0;
		for(f in photos.features)
		{
			if(photos.features[f].atPoint(event.object.center, 20, 20))
			{				
				select.select(photos.features[f]);
			}
			//console.info(photos.features[f]);
		}
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

function setPopupsActive(pop)
{
	if(pop)
	{
		$('#popup-on').show();
		$('#popup-off').hide();
		show_popups = true;
	}
	else
	{
		$('#popup-on').hide();
		$('#popup-off').show();
		show_popups = false;
	}
}

/**
 *  Main code ececuted on loading of script....
 *  
 */

// Set some global variables
var map;
var notts_1861;
var targetAreaLayer;
var targetCircle;
var follow_location = false;
var photos;
var select;
var showPopups = false;
/* Set these in the callinng file to initialize map */
/*var maxOpacity = 0.9;
var minOpacity = 0.1;
var defaultOpacity = 0.3;
//Set the limits to the map view restricting pan and zoom to a ceratin area
var defaultBounds = new OpenLayers.Bounds(-1.4, 52.804, -0.97, 53.104); */
/* */


// Use the jquery $() function to set up script to run on loadComplete of the page...

$(function() {
	/* This section sets up the OpenLayers map stuff */
	/* The default controls are removed and specific ones are added later
	 * depending on whether it's a desktop or mobile version of the map
	 */
	var options = {
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		numZoomLevels: 20,
		maxResolution: 156543.0339,
		restrictedExtent: defaultBounds,
		controls: [ ]
	};

	map = new OpenLayers.Map('map', options);
	var mapBounds = defaultBounds.transform(map.displayProjection, map.projection);

	/* This is a custom OpenStreetMap layer */
	/*       
	var mapnik = new OpenLayers.Layer.OSM(
			 "OSM",
			 "/tiles/${z}/${x}/${y}.png"			
	);
	 */

	/* This is the remote Open Street Map layer */
	var osm = new OpenLayers.Layer.OSM("Remote OSM", "http://tile.openstreetmap.org/${z}/${x}/${y}.png", 
	{
		attribution: '' 
	});
	map.addLayer(osm);
	
	/* This is a google map layer in hybrid mode showing images and roads, etc */
	var google_hybrid = new OpenLayers.Layer.Google("Google Satellite Map", 
	{
		type: G_SATELLITE_MAP,
		sphericalMercator: true,
		maxExtent: mapBounds
	});
	map.addLayer(google_hybrid);

	
	/* This is a google map layer in map mode showing roads, etc */
	var google_map = new OpenLayers.Layer.Google("Google Standard Map", 
	{
		type: G_NORMAL_MAP,
		sphericalMercator: true,
		maxExtent: mapBounds
	});
	map.addLayer(google_map);

	/* Nottingham 1861 image layer */
	notts_1861 = new OpenLayers.Layer.Image(
		'1861 Map',
		'./images/1861_notts.png',
		new OpenLayers.Bounds( -1.158064,  52.946731, -1.139494, 52.958147).transform(map.displayProjection, map.projection),
		new OpenLayers.Size(1492, 1542),
		{	
			isBaseLayer: false,
			opacity: defaultOpacity,
			alwaysInRange: true,
			maxExtent: mapBounds
		}
	);
	map.addLayer(notts_1861);
	
	photos = new OpenLayers.Layer.Vector("Picture the Past", {
		projection: map.displayProjection,
		strategies: [new OpenLayers.Strategy.Fixed()],
		protocol: new OpenLayers.Protocol.HTTP({
			url: "make_kml.php",
			format: new OpenLayers.Format.KML({
				extractStyles: true,
				extractAttributes: true
			})
		})
	});
	map.addLayer(photos);

	targetAreaLayer = new OpenLayers.Layer.Vector("Trigger zone", {
		projection: map.displayProjection
	});
	targetCircle = new OpenLayers.Feature.Vector(
		new OpenLayers.Geometry.Point(-1.15200,  52.94937),
		{},
		{
			pointRadius: 6,
			fill: true
		});
	targetAreaLayer.addFeatures(targetCircle);
	
	map.addLayer(targetAreaLayer);
	
	
	markersLayer = new OpenLayers.Layer.Markers("Location", {
		displayInLayerSwitcher: false
	});
	map.addLayer(markersLayer);
	
	/* Setting up the map */
	/* Also uses JQuery UI to add more controls and control the page layout */

	select = new OpenLayers.Control.SelectFeature(photos);
	map.addControl(select);
    select.activate();

    photos.events.on({
        "featureselected": onFeatureSelect,
        "featureunselected": onFeatureUnselect
    });

	map.events.register('moveend', this, onMapMoved);

	map.addControl(new OpenLayers.Control.Navigation());
	map.addControl(new OpenLayers.Control.LayerSwitcher());
    
	// Add different controls for mobile version and the desktop version
	if(mobileBrowser)
	{
		$(function() {
			this.touchhandler = new TouchHandler(map, 4);
		});
		map.setOptions({ panMethod: null });
		
		//Add rollover image for pin icons
		$('ul#pin-on li, ul#pin-off li').hover(
				function() { $(this).addClass('ui-state-hover'); }, 
				function() { $(this).removeClass('ui-state-hover'); }
		);

		/* This is all about tracking and following the user's location */
		
		setFollowLocation(true);  // Start following as default
		
		// Button to toggle following location or not (but still track and record location)
		$('#pin-control').toggle(function() {
			setFollowLocation(false);
		},
		function() {
			setFollowLocation(true);
		});

		
		//Add rollover image for pin icons
		$('ul#popup-on li, ul#popup-off li').hover(
				function() { $(this).addClass('ui-state-hover'); }, 
				function() { $(this).removeClass('ui-state-hover'); }
		);
		
		//For mobile version make popups appear as default
		setPopupsActive(true);
		// Button to toggle popups of photo data
		$('#popup-control').toggle(function() {
			setPopupsActive(false);
		},
		function() {
			setPopupsActive(true);
		});
		
		
		var hasGeolocation = !!navigator.geolocation;
		var locationOptions = { enableHighAccuracy: true, timeout: 5000 }; 
		var locationWatch = null; 
		$(function() {
			if(hasGeolocation)
			{
				$(function() {
					/* Location tracking feature */
					locationWatch = navigator.geolocation.watchPosition(updatePosition, handleGetPositionErrors, locationOptions);
					//navigator.geolocation.getCurrentPosition(updatePosition, handleGetPositionErrors, locationOptions);
				});
			}
		});
	}
	else
	{
		map.addControl(new OpenLayers.Control.PanZoom());
		map.addControl(new OpenLayers.Control.MousePosition());		
		
		//add buttons to hide/show header
		$('#header-toggle').toggle(function() {
			$('#header-toggle-content').hide();
			$('#hide_header').hide();
			$('#show_header').show();
			windowResized();
		},
		function() {
			$('#header-toggle-content').show();
			$('#hide_header').show();
			$('#show_header').hide();
			windowResized();
		});
		$('#show_header').hide();
	}

	// Add event handler for changing opacity (encompasses the label as well as just the button for 'fat fingers')  
	$('#slider-control-l').click( function() {
		changeOpacity(0.1, notts_1861);
	});
	$('#slider-control-r').click( function() {
		changeOpacity(-0.1, notts_1861);
	});
	//Rollover function for opacity controls
	$('#slider-control-l').hover(
			function() { $('ul#icon-l li').addClass('ui-state-hover'); }, 
			function() { $('ul#icon-l li').removeClass('ui-state-hover'); }
	);
	$('#slider-control-r').hover(
			function() { $('ul#icon-r li').addClass('ui-state-hover'); }, 
			function() { $('ul#icon-r li').removeClass('ui-state-hover'); }
	);
	
	// Set up slider to change opacity 
	$('#slider').slider({
			value: defaultOpacity,
			step: 0.05,
			max: maxOpacity,
			min: minOpacity,
			animate: 'fast',
			slide:function(e, ui){setOpacity(ui.value, notts_1861);}
	});

	// Resize the map to fit window whenever the size is changed
	$(window).resize(windowResized);

	setOpacity(defaultOpacity, notts_1861);
	windowResized();				

	//Centre on Nottingham market square
	//map.setCenter(new OpenLayers.LonLat(-1.15050,  52.95333).transform(map.displayProjection, map.projection), 17);
	//Centre map just outside Brewhouse Yard
	map.setCenter(new OpenLayers.LonLat(-1.15200,  52.94937).transform(map.displayProjection, map.projection), 18);
});