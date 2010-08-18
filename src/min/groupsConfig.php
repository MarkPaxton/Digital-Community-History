<?php
/**
 * Groups configuration for default Minify implementation
 * @package Minify
 */

/** 
 * You may wish to use the Minify URI Builder app to suggest
 * changes. http://yourdomain/min/builder/
 **/

return array(
	'mcp-map-css' => array(		
	//	'//jquery/css/smoothness/jquery-ui-1.8.4.custom.css',
		'//OpenLayers/theme/default/style.css',
		'//css/style.css',
		'//css/mcp_map.css'),
	'mcp-map-js' => array(
		'//js/mcp_map.js'
		// don't compress these files as they're already done (and takes ages!)
/*		new Minify_Source(array(
		    'filepath' => '//jquery/js/jquery-1.4.2.min.js',
		    'minifier' => '')), 
		new Minify_Source(array(
		    'filepath' => '//jquery/js/jquery-ui-1.8.4.custom.min.js',
		    'minifier' => '')), */
/*		new Minify_Source(array(
		    'filepath' => '//OpenLayers/OpenLayers.js',
		    'minifier' => '')), */
	)
 );