# TODO(colin): fix these lint errors (http://pep8.readthedocs.io/en/release-1.7.x/intro.html#error-codes)
# pep8-disable:E128
"""OAuth wrapper for API Explorer

Used to wrap requests send to API server in OAuth credentials
"""
import oauth
import requests


class APIExplorerOAuthClient(object):
    def __init__(self, server_url, consumer_key, consumer_secret):
        self.server_url = server_url
        self.consumer = oauth.OAuthConsumer(consumer_key, consumer_secret)
        self.rest_method_mapping = {"GET": requests.get, "POST": requests.post,
            "PUT": requests.put, "DELETE": requests.delete}
        self.request_token_url = "{0}/api/auth/request_token".format(
            self.server_url)
        self.access_token_url = "{0}/api/auth/access_token".format(
            self.server_url)

    def url_for_request_token(self, callback=None, parameters=None):
        oauth_request = oauth.OAuthRequest.from_consumer_and_token(
            self.consumer, http_url=self.request_token_url, callback=callback,
            parameters=parameters)

        print oauth_request.to_url()
        oauth_request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(),
            self.consumer, None)
        print oauth_request.to_url()

        return oauth_request.to_url()

    def url_for_access_token(self, request_token, callback=None,
                             parameters=None, verifier=None):
        if not verifier and request_token.verifier:
            verifier = request_token.verifier

        oauth_request = oauth.OAuthRequest.from_consumer_and_token(
            self.consumer, token=request_token, http_url=self.access_token_url,
            callback=callback, parameters=parameters, verifier=verifier)

        oauth_request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(),
            self.consumer, request_token)

        return oauth_request.to_url()

    def fetch_access_token(self, request_token):
        r = requests.get(self.url_for_access_token(request_token))
        return oauth.OAuthToken.from_string(r.text)

    def access_api_resource(self, endpoint, access_token, query_params={},
            method="GET"):

        full_url = self.server_url + "/" + endpoint
        method = method.upper()

        oauth_request = oauth.OAuthRequest.from_consumer_and_token(
            self.consumer, token=access_token, http_url=full_url,
            parameters=query_params, http_method=method)

        oauth_request.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(),
            self.consumer, access_token)

        # specifying data for a GET request results in 400 - invalid request
        r = self.rest_method_mapping[method](oauth_request.to_url(),
                data=oauth_request.to_postdata() if method != "GET" else {})

        return r
