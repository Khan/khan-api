import cgi
import os
import readline
import SocketServer
import SimpleHTTPServer
import sys
import urllib2

sys.path.insert(0, os.path.abspath('../../third_party'))

from test_oauth_client import TestOAuthClient
from oauth import OAuthToken
import time

# This is a quick, gross little interactive script for testing our OAuth API.

CONSUMER_KEY = ""
CONSUMER_SECRET = ""
SERVER_URL = ""

REQUEST_TOKEN = None
ACCESS_TOKEN = None

def create_callback_server():
    class CallbackHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
        def do_GET(self):
            global REQUEST_TOKEN

            params = cgi.parse_qs(self.path.split('?', 1)[1], keep_blank_values=False)
            REQUEST_TOKEN = OAuthToken(params['oauth_token'][0], params['oauth_token_secret'][0])
            REQUEST_TOKEN.set_verifier(params['oauth_verifier'][0])

            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write('OAuth request token fetched; you can close this window.')

        def log_request(self, code='-', size='-'):
            pass

    server = SocketServer.TCPServer(('127.0.0.1', 0), CallbackHandler)
    return server

def get_request_token():
    server = create_callback_server()

    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    client.start_fetch_request_token('http://127.0.0.1:%d/' % server.server_address[1])

    server.handle_request()
    # REQUEST_TOKEN has now been set
    server.server_close()

def get_access_token():
    global ACCESS_TOKEN

    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    ACCESS_TOKEN = client.fetch_access_token(REQUEST_TOKEN)

def get_api_resource():

    resource_url = raw_input("Resource relative url (/api/v1/playlists): ") or "/api/v1/playlists"

    client = TestOAuthClient(SERVER_URL, CONSUMER_KEY, CONSUMER_SECRET)
    start = time.time()
    response = client.access_resource(resource_url, ACCESS_TOKEN)
    end = time.time()

    print "\n"
    print response
    print "\nTime: %ss\n" % (end - start)

def run_tests():
    global CONSUMER_KEY, CONSUMER_SECRET, SERVER_URL
    CONSUMER_KEY = raw_input("consumer key (anyone): ") or "anyone"
    CONSUMER_SECRET = raw_input("consumer secret (anyone): ") or "anyone"
    SERVER_URL = raw_input("server base url (http://www.khanacademy.org): ") or "http://www.khanacademy.org"

    # It's a bit annoying for key/secret to be in readline history
    readline.clear_history()
    print

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
        except EOFError:
            print
            break
        except urllib2.HTTPError, e:
            print 'Error: %s' % e
            # Also print the response body in case it has useful information.
            print e.read()
        except Exception, e:
            print "Error: %s" % e

def main():
    run_tests()

if __name__ == "__main__":
    main()
