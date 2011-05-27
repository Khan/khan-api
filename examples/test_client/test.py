from test_oauth_client import TestOAuthClient
from oauth import OAuthToken

# This is a quick, gross little interactive script for testing our OAuth API.

CONSUMER_KEY = ""
CONSUMER_SECRET = ""
SERVER_URL = "" # http://local.kamenstestapp.appspot.com:8084

REQUEST_TOKEN = None
ACCESS_TOKEN = None

def get_request_token():
    global REQUEST_TOKEN

    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    client.start_fetch_request_token()

    print "After logging in and authorizing, input token key and secret..."

    request_token_key = raw_input("request token: ")
    request_token_secret = raw_input("request token secret: ")

    REQUEST_TOKEN = OAuthToken(request_token_key, request_token_secret)

def get_access_token():
    global ACCESS_TOKEN

    print "Fetching access token..."
    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    ACCESS_TOKEN = client.fetch_access_token(REQUEST_TOKEN)

def get_api_resource():

    resource_url = raw_input("Resource relative url (/api/v1/playlists): ") or "/api/v1/playlists"

    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    response = client.access_resource(resource_url, ACCESS_TOKEN)

    print "\n"
    print response
    print "\n"

def run_tests():
    global CONSUMER_KEY, CONSUMER_SECRET, SERVER_URL
    CONSUMER_KEY = raw_input("consumer key (anyone): ") or "anyone"
    CONSUMER_SECRET = raw_input("consumer secret (anyone): ") or "anyone"
    SERVER_URL = raw_input("server base url (http://local.kamenstestapp.appspot.com:8084): ") or "http://local.kamenstestapp.appspot.com:8084"

    get_request_token()
    if not REQUEST_TOKEN:
        print "Did not get request token."
        return
    
    get_access_token()
    if not ACCESS_TOKEN:
        print "Did not get access token."
        return

    while(True):
        try:
            get_api_resource()
        except Exception, e:
            print "Error: %s" % e

def main():
    run_tests()

if __name__ == "__main__":
    main()
