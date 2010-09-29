<?php

define('SITE_ROOT', 'http://www.mrl.nott.ac.uk/~mcp/horizon');

/**
 * Return a string with the KML file prefix for usese with open layers
 * based on sundials.kml example
 */
function make_kml_head()
{
	$output = 
'<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.2">
<Document>
	<name>Picture the past data</name>
	<Style id="photo_placemark_style_highlight">
		<IconStyle>
			<scale>1.4</scale>
			<Icon>
				<href>' . SITE_ROOT . '/images/camera.png</href>
			</Icon>
			<hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
		</IconStyle>
		<LabelStyle>
			<color>ff00aaff</color>
		</LabelStyle>
	</Style>
	<Style id="photo_placemark_style_normal">
		<IconStyle>
			<scale>1.2</scale>
			<Icon>
				<href>' . SITE_ROOT . '/images/camera.png</href>
			</Icon>
			<hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>
		</IconStyle>
		<LabelStyle>
			<color>ff00aaff</color>
		</LabelStyle>
	</Style>
	<StyleMap id="photo_placemark_style">
		<Pair>
			<key>normal</key>
			<styleUrl>#photo_placemark_style_normal</styleUrl>
		</Pair>
		<Pair>
			<key>highlight</key>
			<styleUrl>#photo_placemark_style_highlight</styleUrl>
		</Pair>
	</StyleMap>
	<Folder>
		<name>Picture the Past Photo Collection</name>
		<open>1</open>
		<LookAt>
			<longitude>-1.15050</longitude>
			<latitude>52.95333</latitude>
			<altitude>0</altitude>
			<range>873</range>
			<tilt>0.0</tilt>
			<heading>-16</heading>
		</LookAt>
		<Style>
			<ListStyle>
				<listItemType>check</listItemType>
				<bgColor>00ffffff</bgColor>
			</ListStyle>
		</Style>
		<Folder>
			<name>Photos</name>
';
	return $output; 
}

/**
 * Return the actual kml data for an individual placemark for use with openlayers
 * based on sundials.kml example
 * @param array $row array of ptp_data table row data
 * CREATE TABLE ptp_data (
		Ref_No text primary_key,
		Local_Accession_No text,
		Map_Reference text,
		MapArea text,
		MapLong real,
		MapLat real,
		Town_Village text,
		Location text,
		Title text,
		Further_Information text,
		Date_of_Image text,
		Date_Period text,
		Photographer text,
		Artist text,
		Engraver text,
		Publisher text,
		Acknowledged text,
		Form_of_Acknowledgment text,
		Language_single text,
		Format_single text,
		Publishers_single text,
		License_single text,
		Audience_single text,
		Key_Terms text,
		Keywords text
	);
 */
function make_kml_item($row)
{
	$output = '';
	$url_end = '';
	if(strncmp($row['Ref_No'], 'NTGM', 4)==0)
	{
		$url_end = 'nottingham/' . $row['Ref_No'] . '.jpg';
	}
	if(strncmp($row['Ref_No'], 'DCHQ', 4)==0)
	{
		$url_end = 'derbyshire/' . $row['Ref_No'] . '.jpg';
	}
	$replace_chars = array('', '');
	$sanitised_date = str_replace($replace_chars, '\'', $row['Date_of_Image']);
	$sanitised_description = str_replace($replace_chars, '\'', htmlspecialchars_decode(htmlspecialchars_decode($row['Further_Information'])));
	ob_start();
?>
	<Placemark>
		<name><?php echo($row['Title'] . " (#" . $row['Ref_No'] . ")"); ?></name>
		<description><![CDATA[
		<div><a href='#' class="image-<?php echo($row['Ref_No']); ?>" style="float:right;" onClick='$(".image-<?php echo($row['Ref_No']); ?>").hide(); $(".text-<?php echo($row["Ref_No"]); ?>").show();'>
		<div class='button floatRight'>
				<ul class='ui-widget'>
					<li class='ui-state-default ui-corner-all' title='Show text'>Show text</li>
				</ul>
			</div>
		</a></div>
		<div><a class="text-<?php echo($row['Ref_No']); ?>" style="float:right;display:none;" href='#' onClick='$(".image-<?php echo($row['Ref_No']); ?>").show(); $(".text-<?php echo($row["Ref_No"]); ?>").hide();'>
			<div class='button floatRight'>
				<ul class='ui-widget'>
					<li class='ui-state-default ui-corner-all' title='Show text'>Show photo</li>
				</ul>
			</div>
		</a></div>
		<div style="float:left;">Date of image: <?php echo($sanitised_date); ?></div>
		<div style="clear:both;">
			<div class="image-<?php echo($row['Ref_No']); ?>">
				<img src="https://www.hpacde.org.uk/picturethepast/jpgl_<?php echo($url_end) ?>">	
			</div>
			<div class="text-<?php echo($row['Ref_No']); ?>" style="display:none;clear:both;">
				<?php echo($sanitised_description); ?>
			</div>
		</div>
		]]></description>
		<LookAt>
			<longitude><?php echo(htmlspecialchars($row['MapLat'])) ?></longitude>
			<latitude><?php echo(htmlspecialchars($row['MapLong']))?></latitude>
			<altitude>0</altitude>
			<range>24</range>
			<tilt>0</tilt>
			<heading>0</heading>
		</LookAt>
		<styleUrl>#photo_placemark_style</styleUrl>
		<Point>
			<coordinates><?php echo(htmlspecialchars($row['MapLat']) . ',' . htmlspecialchars($row['MapLong'])) ?></coordinates>
		</Point>
	</Placemark>
<?php 
	$output = ob_get_clean();
	return $output;
}

/**
 * Return a string with the KML file suffix for usese with open layers
 * based on sundials.kml example
 */
function make_kml_tail()
{
	$output = '
		</Folder>
	</Folder>
</Document>
</kml>';
	return $output;
}


try {
    $dbh = new PDO('sqlite:./ptp.db');
    $ids_to_use = array(
    	'NTGM017475',
		'NTGM016059',
		'NTGM016028',
		'NTGM015221',
		'NTGM015215',
		'NTGM015209',
		'NTGM015208',
		'NTGM015207',
		'NTGM013332',
		'NTGM013248',
		'NTGM013155',
		'NTGM013151',
		'NTGM013150',
		'NTGM012741',
		'NTGM012740',
		'NTGM012735',
		'NTGM012726',
		'NTGM012721',
		'NTGM012708',
		'NTGM012703',
		'NTGM012078',
		'NTGM010416',
		'NTGM010415',
		'NTGM010409',
		'NTGM010408',
		'NTGM009551',
		'NTGM009514',
		'NTGM009512',
		'NTGM009217',
		'NTGM009150',
		'NTGM007113',
		'NTGM007112',
		'NTGM005303',
		'NTGM005286',
		'NTGM005269',
		'NTGM005231',
		'NTGM005230',
		'NTGM005229',
		'NTGM004614',
		'NTGM004605',
		'NTGM004488',
		'NTGM004445',
		'NTGM004444',
		'NTGM004442',
		'NTGM004441',
		'NTGM004440',
		'NTGM004439',
		'NTGM004438',
		'NTGM004437',
		'NTGM004386',
		'NTGM004385',
		'NTGM004380',
		'NTGM004379',
		'NTGM004378',
		'NTGM004372',
		'NTGM004371',
		'NTGM004346',
		'NTGM004282',
		'NTGM004281',
		'NTGM004280',
		'NTGM004279',
		'NTGM004278',
		'NTGM004178',
		'NTGM004177',
		'NTGM004176',
		'NTGM002923',
		'NTGM002886',
		'NTGM002877',
		'DCHQ504750',
		'DCHQ504747',
		'DCHQ504715',
		'DCHQ504714',
		'DCHQ504713',
		'DCHQ504712',
		'DCHQ502757',
		'DCHQ502756',
		'DCHQ502755',
		'DCHQ502753',
		'DCHQ502752',
		'DCHQ002076'
    );
	$other_ids_to_use = array(
		'NTGM013151', 'NTGM013155', 'NGTG004445', 'NTGM013248', 'NTGM012740'
    );
    
    if(array_key_exists('set', $_GET))
    {
    	$mode = $_GET['set'];
    }
    else 
    {
    	$mode = '';
    }
    
    // set a mode parameter in the URL to select which subset of points to use...
    switch($mode)
    {
		case 'selected':
			// selected images around trip
			$where = " WHERE (`Ref_No`='" . implode("') OR (`Ref_No`='", $other_ids_to_use) . "')";
		break;    		
		case 'trip':
			// all images containing trip && jerusalem
			$where = " WHERE (`Ref_No`='" . implode("') OR (`Ref_No`='", $ids_to_use) . "')";    		
		break;
    	case 'full':
    		// All data including duplicate locations
			$where = "";
		break; 
		default:
			// Limited set filtering duplicaters from a particular location
	    	$where =  " WHERE (`MapLong` != '52.95435674') AND (`MapLat` != '-1.153011124')";
    }
    $query = "SELECT * from ptp_data" . $where . ";";

    if(array_key_exists('debug', $_GET))
    {
    	echo($query);
		exit;
    }
    
    $rows = array();
    foreach($dbh->query($query) as $row) {
        //print_r($row);
        $rows[] = $row;
    }
    $dbh = null;
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}

header("Content-Type: application/vnd.google-earth.kml+xml kml; charset=utf8");
header("Content-disposition: attachment; filename=ptp_photos.kml"); 
$output = make_kml_head();
foreach($rows as $row)
{
	$output .= make_kml_item($row);
}
$output .= make_kml_tail();

ob_start("ob_gzhandler");
echo $output;
ob_flush();
?>