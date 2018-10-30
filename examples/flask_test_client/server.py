from flask import Flask, request, redirect, url_for, jsonify
import time
import json
from khan_api import KhanAcademySignIn, KhanAPI

app = Flask(__name__)
app.config["SECRET_KEY"] = "super secret key"


def get_access_tokens():
    # We use a json file here for simplicity, but in production you would likely
    # store the token and secret in a database table

    # fetch token data from saved json file
    try:
        with open("tokens.json", "r") as f:
            tokens = json.loads(f.read())
    except FileNotFoundError:
        return None, None

    # check if tokens are expired. Experimentation shows that they have a
    # freshness of 2 weeks.
    now = time.time()
    if now - tokens["timestamp"] > 3600 * 24 * 14:
        return None, None

    # tokens are still valid, so return them
    return tokens["token"], tokens["secret"]


def set_access_tokens(token, secret):
    # update file with new tokens and timestamp
    with open("tokens.json", "w") as t:
        now = time.time()
        t.write(
            json.dumps({"token": token, "secret": secret, "timestamp": now})
        )


@app.route("/oauth_authorize")
def oauth_authorize():
    oauth = KhanAcademySignIn()
    return oauth.authorize()


@app.route("/oauth_callback")
def oauth_callback():
    oauth = KhanAcademySignIn()
    access_token, access_token_secret = oauth.callback()

    set_access_tokens(access_token, access_token_secret)

    return redirect(url_for("index"))


@app.route("/")
def index():
    # try to get token and secret, and if they don't exist then redirect to
    # the authorize url
    token, secret = get_access_tokens()
    if not token or not secret:
        return redirect(url_for("oauth_authorize"))

    # Now that we have the token and secret, we can get the authorized user
    # and return a simple html page
    kapi = KhanAPI(token, secret)
    user = kapi.user()
    return """
    <doctype! html>
    <html>
      <head></head>
      <body>
        <h3>User: {user}</h3>
        <h3>Token: {token}</h3>
        <h3>Secret: {secret}</h3>
        <p>
          You are now authorized! Try other endpoints by entering the following
          url pattern in your browser:
          http://localhost:5000/get_api/&lt;end_point&gt;
        </p>
        <p>
          try
          <a
            href="http://localhost:5000/get_api/api/v1/user/exercises/addition_1"
            target="_blank">
            http://localhost:5000/get_api/api/v1/user/exercises/addition_1
          </a>
        </p>
      </body>
    </html>
    """.format(
        user=user["nickname"], token=token, secret=secret
    )


@app.route("/get_api/<path:endpoint>")
def khanacademy_fetch_path(endpoint):
    token, secret = get_access_tokens()
    if not token or not secret:
        return redirect(url_for("oauth_authorize"))
    kapi = KhanAPI(token, secret)

    endpoint = "/" + endpoint
    params = {k: v for k, v in request.args.items()}
    res = kapi.get(endpoint, params)

    return jsonify(res)


if __name__ == "__main__":
    app.run(debug=True)
