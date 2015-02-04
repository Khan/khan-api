<?php

/**
 * oauth-php: Example OAuth client for accessing Google Docs
 *
 * @author BBG
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

define("GOOGLE_CONSUMER_KEY", "FILL THIS"); // 
define("GOOGLE_CONSUMER_SECRET", "FILL THIS"); // 

define("GOOGLE_OAUTH_HOST", "https://www.google.com");
define("GOOGLE_REQUEST_TOKEN_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthGetRequestToken");
define("GOOGLE_AUTHORIZE_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthAuthorizeToken");
define("GOOGLE_ACCESS_TOKEN_URL", GOOGLE_OAUTH_HOST . "/accounts/OAuthGetAccessToken");

define('OAUTH_TMP_DIR', function_exists('sys_get_temp_dir') ? sys_get_temp_dir() : realpath($_ENV["TMP"]));

//  Init the OAuthStore
$options = array(
	'consumer_key' => GOOGLE_CONSUMER_KEY, 
	'consumer_secret' => GOOGLE_CONSUMER_SECRET,
	'server_uri' => GOOGLE_OAUTH_HOST,
	'request_token_uri' => GOOGLE_REQUEST_TOKEN_URL,
	'authorize_uri' => GOOGLE_AUTHORIZE_URL,
	'access_token_uri' => GOOGLE_ACCESS_TOKEN_URL
);
// Note: do not use "Session" storage in production. Prefer a database
// storage, such as MySQL.
OAuthStore::instance("Session", $options);

try
{
	//  STEP 1:  If we do not have an OAuth token yet, go get one
	if (empty($_GET["oauth_token"]))
	{
		$getAuthTokenParams = array('scope' => 
			'http://docs.google.com/feeds/',
			'xoauth_displayname' => 'Oauth test',
			'oauth_callback' => 'http://likeorhate.local/google.php');

		// get a request token
		$tokenResultParams = OAuthRequester::requestRequestToken(GOOGLE_CONSUMER_KEY, 0, $getAuthTokenParams);

		//  redirect to the google authorization page, they will redirect back
		header("Location: " . GOOGLE_AUTHORIZE_URL . "?btmpl=mobile&oauth_token=" . $tokenResultParams['token']);
	}
	else {
		//  STEP 2:  Get an access token
		$oauthToken = $_GET["oauth_token"];
		
		// echo "oauth_verifier = '" . $oauthVerifier . "'<br/>";
		$tokenResultParams = $_GET;
		
		try {
		    OAuthRequester::requestAccessToken(GOOGLE_CONSUMER_KEY, $oauthToken, 0, 'POST', $_GET);
		}
		catch (OAuthException2 $e)
		{
			var_dump($e);
		    // Something wrong with the oauth_token.
		    // Could be:
		    // 1. Was already ok
		    // 2. We were not authorized
		    return;
		}
		
		// make the docs requestrequest.
		$request = new OAuthRequester("http://docs.google.com/feeds/documents/private/full", 'GET', $tokenResultParams);
		$result = $request->doRequest(0);
		if ($result['code'] == 200) {
			var_dump($result['body']);
		}
		else {
			echo 'Error';
		}
	}
}
catch(OAuthException2 $e) {
	echo "OAuthException:  " . $e->getMessage();
	var_dump($e);
}
?>