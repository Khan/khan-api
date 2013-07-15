"""Backend of API Explorer

Serves as a proxy between client side code and API server
"""

import cgi
import json
import logging
import sys

import flask
import oauth
import werkzeug.debug

import api_explorer_oauth_client
try:
    import secrets
except ImportError:
    # If the secrets aren't present, we can't run the server.
    logging.critical("Can't find secrets.py.\nCopy secrets.example.py" +
        " to secrets.py, enter the necessary values, and try again.")
    sys.exit(1)

app = flask.Flask(__name__)
app.config.from_object('explorer.settings')

if app.debug:
    app.wsgi_app = werkzeug.debug.DebuggedApplication(app.wsgi_app,
        evalex=True)

# Keep around an instance of the client. It's reusable because all the
# stateful stuff is passed around as parameters.
OAuthClient = api_explorer_oauth_client.APIExplorerOAuthClient(
    secrets.server_url, secrets.consumer_key, secrets.consumer_secret)


@app.route("/clear")
def clear():
    clear_session()
    return index()

@app.route("/")
def index():
    return flask.render_template("index.html",
        is_logged_in=is_logged_in())


@app.route("/group/<path:group>")
def group_url(group):
    if not flask.request.is_xhr:
        return index()
    else:
        return "Invalid request", 400


@app.route("/api/v1/<path:method>")
def api_proxy(method):
    # Relies on X-Requested-With header
    # http://flask.pocoo.org/docs/api/#flask.Request.is_xhr
    url_template = "api/v1/{0}"
    if flask.request.is_xhr:

        resource = OAuthClient.access_api_resource(
            url_template.format(method), access_token(),
            query_params=flask.request.args.items(),
            method=flask.request.method)

        response_text = resource.text
        if "text/html" in resource.headers["Content-Type"]:
            # per this stackoverflow thread
            # http://stackoverflow.com/questions/1061697/whats-the-easiest-way-to-escape-html-in-python
            response_text = cgi.escape(response_text).encode("ascii",
                "xmlcharrefreplace")

        response = flask.make_response(response_text)

        # Include the original headers and status as custom response headers.
        # The client side will know what to do with these.
        response.headers["X-Original-Headers"] = json.dumps(dict(
            resource.headers))
        response.headers["X-Original-Status"] = resource.status_code
        response.headers["Content-Type"] = resource.headers["Content-Type"]

        return response
    else:
        return index()


# Begin the process of getting a request token from Khan.
@app.route("/oauth_get_request_token")
def oauth_get_request_token():
    request_token_url = OAuthClient.url_for_request_token(
        flask.url_for("oauth_callback",
            continuation=flask.request.args.get("continue"),
            _external=True))

    logging.debug("Redirecting to request token URL: \n{0}".format(
        request_token_url))
    return flask.redirect(request_token_url)


# The OAuth approval flow finishes here.
# Query string version would have been preferable though it causes oauth
# signature errors.
@app.route("/oauth_callback")
@app.route("/oauth_callback/<path:continuation>")
def oauth_callback(continuation=None):
    oauth_token = flask.request.args.get("oauth_token", "")
    oauth_secret = flask.request.args.get("oauth_token_secret", "")
    oauth_verifier = flask.request.args.get("oauth_verifier", "")

    request_token = oauth.OAuthToken(oauth_token, oauth_secret)
    request_token.set_verifier(oauth_verifier)

    flask.session["request_token_string"] = request_token.to_string()

    # We do this before we redirect so that there's no "limbo" state where the
    # user has a request token but no access token.
    access_token = OAuthClient.fetch_access_token(request_token)
    flask.session["oauth_token_string"] = access_token.to_string()

    # We're done authenticating, and the credentials are now stored in the
    # session. We can redirect back home.
    if continuation:
        return flask.redirect(continuation)
    else:
        return flask.redirect(flask.url_for("index"))


def access_token():
    token_string = flask.session.get("oauth_token_string")

    # Sanity check.
    if not token_string:
        clear_session()
        return None

    return oauth.OAuthToken.from_string(token_string)


def is_logged_in():
    return ("request_token_string" in flask.session and
            "oauth_token_string" in flask.session)


def clear_session():
    flask.session.pop("request_token_string", None)
    flask.session.pop("oauth_token_string", None)

