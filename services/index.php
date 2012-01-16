<?php
	// PHP Proxy
	// Loads a XML from any location. Used with Flash/Flex apps to bypass security restrictions
	// Author: Paulo Fierro
	// January 29, 2006
	// usage: proxy.php?url=http://mysite.com/myxml.xml
	
	
	$url = $_GET['url'];
	$contentType = $_GET['cType'];
	
	$session = curl_init($url); 	               // Open the Curl session
	curl_setopt($session, CURLOPT_HEADER, false); 	       // Don't return HTTP headers
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);   // Do return the contents of the call
	$file = curl_exec($session); 	                       // Make the call
	header("Content-Type: text/".$contentType); 	               // Set the content type appropriately
	echo $file; 	      // Spit out the xml
	curl_close($session); // And close the session
?>
