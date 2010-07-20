var map;
var whitehall_1680;
var follow_location = false;

/* Set these in the callinng file to initialize map */
/*var maxOpacity = 0.9;
var minOpacity = 0.1;
var defaultOpacity = 0.3;
//Set the limits to the map view restricting pan and zoom to a ceratin area
var defaultBounds = new OpenLayers.Bounds(-1.4, 52.804, -0.97, 53.104); */
/* */


$(function() {
	/* This section sets up the OpenLayers map stuff */
	/* The default controls are removed and specific ones are added later
	 * depending on whether it's a desktop or mobile version of the map
	 */
	var options = {
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		numZoomLevels: 19,
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

	/* This is a google map layer in hybrid mode showing images and roads, etc */
	var google_hybrid = new OpenLayers.Layer.Google("Google Satellite Map", 
	{
		type: G_SATELLITE_MAP,
		sphericalMercator: true,
		maxExtent: mapBounds
	});

	/* This is a google map layer in map mode showing roads, etc */
	var google_map = new OpenLayers.Layer.Google("Google Standard Map", 
	{
		type: G_NORMAL_MAP,
		sphericalMercator: true,
		maxExtent: mapBounds
	});

	/* Nottingham 1861 image layer */
	whitehall_1680 = new OpenLayers.Layer.Image(
		'Whitehall 1680 Map',
		'./images/whitehall_cropped_rotated.png',
		new OpenLayers.Bounds( -0.128531, 51.502708, -0.123165, 51.507038).transform(map.displayProjection, map.projection),
		new OpenLayers.Size(549, 766),
		{	
			isBaseLayer: false,
			opacity: defaultOpacity,
			alwaysInRange: true,
			maxExtent: mapBounds
		}
	);

	whitehall_1680.events.on({
		loadstart: function() {
			OpenLayers.Console.log("loadstart");
		},
		loadend: function() {
			OpenLayers.Console.log("loadend");
		}
	});


	markersLayer = new OpenLayers.Layer.Markers("Location", {
		displayInLayerSwitcher: false
	});
	
	/* Setting up the map */
	/* Also uses JQuery UI to add more controls and control the page layout */
	
	map.addLayers([osm, google_hybrid, google_map, whitehall_1680, markersLayer]);
	map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.addControl(new OpenLayers.Control.Navigation());
	// Add different controls for mobile version and the desktop version
	if(mobileBrowser)
	{
		map.addControl(new OpenLayers.Control.LayerSwitcher());
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
		map.addControl(new OpenLayers.Control.LayerSwitcher());
	}

	// Add event handler for changing opacity (encompasses the label as well as just the button for 'fat fingers')  
	$('#slider-control-l').click( function() {
		changeOpacity(0.1, whitehall_1680);
	});
	$('#slider-control-r').click( function() {
		changeOpacity(-0.1, whitehall_1680);
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
	
	// Set up s lider to change opacity 
	$('#slider').slider({
			value: defaultOpacity,
			step: 0.05,
			max: maxOpacity,
			min: minOpacity,
			animate: 'fast',
			slide:function(e, ui){setOpacity(ui.value, whitehall_1680);}
	});

	// Resize the map to fit window whenever the size is changed
	$(window).resize(windowResized);

	setOpacity(defaultOpacity, whitehall_1680);
	windowResized();				

	//Centre on Nottingham market square
	map.setCenter(new OpenLayers.LonLat(-0.126224,  51.504849).transform(map.displayProjection, map.projection), 16);
});