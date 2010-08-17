
//Remove the Nottingham layer
map.removeLayer(maplayers['notts_1861']);

/* Set new default bounds */
defaultBounds = new OpenLayers.Bounds(-0.13633, 51.4931, -0.10912, 51.51354);
mapBounds = defaultBounds.transform(map.displayProjection, map.projection);

map.setOptions({
	restrictedExtent: mapBounds
});

maplayers['google_hybrid'].addOptions({
	maxExtent: mapBounds
});

maplayers['google_map'].addOptions({
	maxExtent: mapBounds
});

/* whitehall 1680 image layer */
maplayers['whitehall_1680'] = new OpenLayers.Layer.Image(
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
transparentLayer = 'whitehall_1680';

$('#opacity-control-l>div.slider-label').html('1680');

maplayers['whitehall_1680'].events.on({
	loadstart: function() {
		OpenLayers.Console.log("loadstart");
	},
	loadend: function() {
		OpenLayers.Console.log("loadend");
	}
});

map.addLayer(maplayers['whitehall_1680']);

//Centre on Whitehall market square
map.setCenter(new OpenLayers.LonLat(-0.12571,  51.50489).transform(map.displayProjection, map.projection), 17);

