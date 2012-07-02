import cgi, os, sys

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '../lib')))

from flask import *

from ConfigParser import ConfigParser, NoSectionError
from api_explorer_oauth_client import APIExplorerOAuthClient
from oauth import OAuthToken

import urllib
from urllib import urlencode
import urllib2
import string
import time

# Sensitive values are placed in a secrets file that isn't checked into
# version control.
try:
    import secrets
except:
    # If the secrets aren't present, we can't run the server.
    print ("Can't find secrets.py.\nCopy secrets.example.py to secrets.py," +
        " enter the necessary values, and try again.")
    sys.exit()


# Keep around an instance of the client. It's reusable because all the
# stateful stuff is passed around as parameters.
CLIENT = APIExplorerOAuthClient(secrets.server_url,
        secrets.consumer_key,
        secrets.consumer_secret
        )

app = Flask(__name__)

# The secret key for encrypting our cookies.
app.secret_key = secrets.app_secret_key


# ======
# ROUTES
# ======

@app.route('/')
def index():
    return render_template('index.html', has_access_token=has_access_token())

# Given a URL, makes a proxied request for an API resource and returns the
# response.
@app.route('/proxy')
def proxy():
    url = request.args.get('url', None)
    if not url:
        abort(400)

    # Returns a dictionary with keys: 'headers', 'body', and 'status'.
    resource = CLIENT.access_api_resource(
        url,
        access_token(),
        method = request.method
        )
    
    text = resource['body']

    # Error messages can contain HTML. Escape them so they're not rendered.
    is_html = has_text_html_header(resource['headers'])
    if is_html:
        text = cgi.escape(text)
    
    response = make_response(text)
    # Include the original headers and status as custom response headers. The
    # client side will know what to do with these.
    response.headers['X-Original-Headers'] = urllib.quote("".join(resource['headers']))
    response.headers['X-Original-Status']  = resource['status']
    
    if is_html:
        response.headers['Content-Type'] = 'text/html'
    else:
        response.headers['Content-Type'] = 'application/json'
    
    return response
        
# Begin the process of getting a request token from Khan.
@app.route('/oauth_get_request_token')
def oauth_get_request_token():
    request_token_url = CLIENT.url_for_request_token(
            callback = url_for('.oauth_callback', _external=True)
            )
    print "Redirecting to request token URL: \n%s" % (request_token_url)
    return redirect(request_token_url)

# The OAuth approval flow finishes here.
@app.route('/oauth_callback')
def oauth_callback():
    oauth_token    = request.args.get('oauth_token',  '')
    oauth_secret   = request.args.get('oauth_token_secret', '')
    oauth_verifier = request.args.get('oauth_verifier', '')

    request_token = OAuthToken(oauth_token, oauth_secret)
    request_token.set_verifier(oauth_verifier)
    
    session['request_token']  = request_token
    
    # We do this before we redirect so that there's no "limbo" state where the
    # user has a request token but no access token.
    access_token = CLIENT.fetch_access_token(request_token)
    session['oauth_token_string'] = access_token.to_string()

    # We're done authenticating, and the credentials are now stored in the
    # session. We can redirect back home.
    return redirect(url_for('.index'))


# ===============
# UTILITY METHODS
# ===============

def has_request_token():
    return 'request_token' in session

def has_access_token():
    return 'oauth_token_string' in session

def is_connected():
    return has_request_token() and has_access_token()
    
def access_token():
    try:
        token_string = session['oauth_token_string']
    except KeyError:
        token_string = None

    # Sanity check.
    if not token_string:
        clear_session()
        return None
        
    return OAuthToken.from_string(token_string)
    
def clear_session():
    session.pop('request_token', None)
    session.pop('oauth_token_string', None)
    
# Expects an array of headers. Figures out if the `Content-Type` is
# `text/html`.
def has_text_html_header(headers):
    for header in headers:
        if (string.find(header, 'Content-Type') > -1 and 
            string.find(header, 'text/html') > -1):
            return True
    return False
    
if __name__ == '__main__':
    app.debug = True
    app.run()
