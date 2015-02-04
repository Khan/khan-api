<?php

/**
 * oauth-php: Example OAuth client
 *
 * Performs simple 2-legged authentication
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

// register at http://twitter.com/oauth_clients and fill these two 
define("TWITTER_CONSUMER_KEY", "FILL THIS");
define("TWITTER_CONSUMER_SECRET", "FILL THIS");

define("TWITTER_OAUTH_HOST","https://twitter.com");
define("TWITTER_REQUEST_TOKEN_URL", TWITTER_OAUTH_HOST . "/oauth/request_token");
define("TWITTER_AUTHORIZE_URL", TWITTER_OAUTH_HOST . "/oauth/authorize");
define("TWITTER_ACCESS_TOKEN_URL", TWITTER_OAUTH_HOST . "/oauth/access_token");
define("TWITTER_PUBLIC_TIMELINE_API", TWITTER_OAUTH_HOST . "/statuses/public_timeline.json");
define("TWITTER_UPDATE_STATUS_API", TWITTER_OAUTH_HOST . "/statuses/update.json");

define('OAUTH_TMP_DIR', function_exists('sys_get_temp_dir') ? sys_get_temp_dir() : realpath($_ENV["TMP"])); 

// Twitter test
$options = array('consumer_key' => TWITTER_CONSUMER_KEY, 'consumer_secret' => TWITTER_CONSUMER_SECRET);
OAuthStore::instance("2Leg", $options);

try
{
	// Obtain a request object for the request we want to make
	$request = new OAuthRequester(TWITTER_REQUEST_TOKEN_URL, "POST");
	$result = $request->doRequest(0);
	parse_str($result['body'], $params);
	
	echo "aa";

	// now make the request. 
    $request = new OAuthRequester(TWITTER_PUBLIC_TIMELINE_API, 'GET', $params);
    $result = $request->doRequest();
}
catch(OAuthException2 $e)
{
	echo "Exception" . $e->getMessage();
}

?>