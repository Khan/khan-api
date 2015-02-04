<?php

/**
 * oauth-php: Example OAuth client
 *
 * Performs simple 2-legged authentication
 *
 * @author Ben Hesketh
 *
 * 
 * The MIT License
 * 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


include_once "../../library/OAuthStore.php";
include_once "../../library/OAuthRequester.php";

// Test of the OAuthStore2Leg 
// uses http://term.ie/oauth/example/

$key = 'key'; // fill with your public key 
$secret = 'secret'; // fill with your secret key
$url = "http://term.ie/oauth/example/request_token.php"; // fill with the url for the oauth service

$options = array('consumer_key' => $key, 'consumer_secret' => $secret);
OAuthStore::instance("2Leg", $options);

$method = "GET";
$params = null;

try
{
	// Obtain a request object for the request we want to make
	$request = new OAuthRequester($url, $method, $params);

	// Sign the request, perform a curl request and return the results, 
	// throws OAuthException2 exception on an error
	// $result is an array of the form: array ('code'=>int, 'headers'=>array(), 'body'=>string)
	$result = $request->doRequest();
	
	$response = $result['body'];
	
	if ($response != 'oauth_token=requestkey&oauth_token_secret=requestsecret') 
	{
		echo 'Error! $response ' . $response;
	}
	else 
	{
	}


	var_dump($response);
}
catch(OAuthException2 $e)
{
	echo "Exception" . $e->getMessage();
}

?>
