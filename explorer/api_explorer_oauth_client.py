import cgi
import urllib2
import urlparse

from oauth import (
    OAuthConsumer, OAuthToken, OAuthRequest, OAuthSignatureMethod_HMAC_SHA1)


class APIExplorerOAuthClient(object):
    def __init__(self, server_url, consumer_key, consumer_secret):
        self.server_url = server_url
        self.consumer = OAuthConsumer(consumer_key, consumer_secret)

    def url_for_request_token(self, callback=None, parameters=None):
        http_url = "%s/api/auth/request_token" % self.server_url
        oauth_request = OAuthRequest.from_consumer_and_token(
            self.consumer,
            http_url=http_url,
            callback=callback,
            parameters=parameters
            )
        oauth_request.sign_request(
            OAuthSignatureMethod_HMAC_SHA1(), self.consumer, None
            )

        return oauth_request.to_url()

    def url_for_access_token(self, request_token, callback=None,
                             parameters=None, verifier=None):
        http_url = "%s/api/auth/access_token" % self.server_url
        if not verifier and request_token.verifier:
            verifier = request_token.verifier

        oauth_request = OAuthRequest.from_consumer_and_token(
            self.consumer,
            token=request_token,
            http_url=http_url,
            callback=callback,
            parameters=parameters,
            verifier=verifier
            )
        oauth_request.sign_request(
            OAuthSignatureMethod_HMAC_SHA1(), self.consumer, request_token
            )

        return oauth_request.to_url()

    def fetch_access_token(self, request_token):
        url = self.url_for_access_token(request_token)
        return OAuthToken.from_string(get_response(url))

    # Make an OAuth-wrapped API request to an arbitrary URL.
    def access_api_resource(self, relative_url, access_token, method="GET"):
        full_url = self.server_url + relative_url

        # Escape each parameter value.
        url = urlparse.urlparse(full_url)
        query_params = cgi.parse_qs(url.query)
        for key in query_params:
            query_params[key] = query_params[key][0]

        oauth_request = OAuthRequest.from_consumer_and_token(
            self.consumer,
            token=access_token,
            http_url=full_url,
            parameters=query_params,
            http_method=method
            )
        oauth_request.sign_request(
            OAuthSignatureMethod_HMAC_SHA1(), self.consumer, access_token
            )

        file = None
        ret = None

        try:
            if method == "GET":
                file = urllib2.urlopen(oauth_request.to_url())
            else:
                file = urllib2.urlopen(url.path, oauth_request.to_postdata())

        except urllib2.HTTPError, error:
            # We don't want to treat HTTP error codes (401, 404, etc.) like
            # exceptional scenarios. We want to pass them along like anything
            # else.
            # Luckily, the exception raised here acts very much like an
            # `HTTPResponse` object. Good enough for our purposes.
            file = error

        finally:
            if file:
                ret = {
                    'headers': file.info().headers,
                    'status': file.code,
                    'body': file.read()
                    }
                file.close()

        return ret


def get_response(url):
    response = ""
    file = None
    try:
        file = urllib2.urlopen(url)
        response = file.read()
    finally:
        if file:
            file.close()

    return response
