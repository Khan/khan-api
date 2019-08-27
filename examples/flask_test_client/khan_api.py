"""
This example script shows a possible method for integrating the Khan API into
a flask server
"""

from rauth import OAuth1Service
import requests
from flask import url_for, request, redirect, session
from time import time
import json

# You can get a CONSUMER_KEY and CONSUMER_SECRET for your app here:
# http://www.khanacademy.org/api-apps/register
CONSUMER_KEY = ""
CONSUMER_SECRET = ""

# Oauth configuration values described at:
# https://github.com/Khan/khan-api/wiki/Khan-Academy-API-Authentication
SERVER_URL = "https://www.khanacademy.org"
REQUEST_TOKEN_URL = SERVER_URL + "/api/auth2/request_token"
ACCESS_TOKEN_URL = SERVER_URL + "/api/auth2/access_token"
AUTHORIZE_URL = SERVER_URL + "/api/auth2/authorize"
BASE_URL = SERVER_URL + "/api/auth2"

# This is the class we will import into our server to provide the authentication
# flow
class KhanAcademySignIn:
    """
    The basic oauth flow will require two endpoints in the flask app:
    1. An authorize endpoint, like @app.route('/authorize'), where you will
       instantiate the class and call the authorize method. i.e:
       @app.route('/authorize')
       def authorize():
           oauth = KhanAcademySignIn()
           return oauth.authorize()
    2. A callback endpoint that you can use to store your token and secret:
       @app.route("/oauth_callback")
       def oauth_callback():
           oauth = KhanAcademySignIn()
           ka_user, access_token, access_token_secret = oauth.callback()

           ## Developer created function to store the tokens ##
           set_access_tokens(access_token, access_token_secret)

           return redirect(url_for("index"))
    """

    def __init__(self):
        self.service = OAuth1Service(
            name="Khan API Flask Example",
            consumer_key=CONSUMER_KEY,
            consumer_secret=CONSUMER_SECRET,
            request_token_url=REQUEST_TOKEN_URL,
            access_token_url=ACCESS_TOKEN_URL,
            authorize_url=AUTHORIZE_URL,
            base_url=BASE_URL,
        )

    # expects that you have defined an endpoint /oauth_callback in your
    # flask server. Usually this looks like:
    # @app.route("/oauth_callback")
    # def oauth_callback():
    #   ...
    def get_callback_url(self):
        return url_for("oauth_callback", _external=True)

    def authorize(self):
        request_token, request_token_secret = self.service.get_request_token(
            params={"oauth_callback": self.get_callback_url()}, method="POST"
        )
        session["request_token"] = request_token
        session["request_token_secret"] = request_token_secret
        return redirect(self.service.get_authorize_url(request_token))

    def callback(self):
        request_token = session.pop("request_token")
        request_token_secret = session.pop("request_token_secret")

        if "oauth_verifier" not in request.args:
            return None, None, None
        oauth_session = self.service.get_auth_session(
            request_token,
            request_token_secret,
            data={"oauth_verifier": request.args["oauth_verifier"]},
        )
        access_token = oauth_session.access_token
        access_token_secret = oauth_session.access_token_secret
        return access_token, access_token_secret


class KhanAPI:
    """
    Basic api class to access the Khan Academy api. If instantiated with a token
    and secret it will allow for authenticated endpoints. More endpoints could
    be added to align with those found at https://api-explorer.khanacademy.org/
    """

    def __init__(self, access_token=None, access_token_secret=None):
        self.authorized = False
        # We need an access token and secret to make authorized calls
        # Otherwise we can only access open endpoints
        if access_token and access_token_secret:
            self.service = OAuth1Service(
                name="khan_oauth",
                consumer_key=CONSUMER_KEY,
                consumer_secret=CONSUMER_SECRET,
                request_token_url=REQUEST_TOKEN_URL,
                access_token_url=ACCESS_TOKEN_URL,
                authorize_url=AUTHORIZE_URL,
                base_url=BASE_URL,
            )
            self.session = self.service.get_session(
                (access_token, access_token_secret)
            )
            self.authorized = True
        self.get_resource = self.get

    def get(self, url, params={}):
        if self.authorized:
            response = self.session.get(SERVER_URL + url, params=params)
            try:
                return response.json()
            except ValueError:
                # Checking if it was a server error, in which case we will let
                # the programmer deal with a workaround. Otherwise, print the
                # response details to the console for debugging.
                if response.status_code == 500:
                    print(
                        "500 error receieved. You should do something with it!"
                    )
                    return {"error": 500}
                print("#" * 50)
                print("Status Code: ", response.status_code)
                print("Content-Type: ", response.headers["content-type"])
                print("Text:")
                print(response.text)
                print("#" * 50)
                raise

        else:

            return requests.get(SERVER_URL + url, params=params).json()

    ############################################################################
    ############ THE FIRST SECTION IS THE DOCUMENTED API AS FOUND AT  ##########
    ############ https://api-explorer.khanacademy.org/                ##########

    # BADGES
    def badges(self, params={}):
        """
        Retrieve a list of all badges. If authenticated, badges that have been
        earned by the specified user will contain extra UserBadge information.
        :param: params: one of four identifiers:
          username,
          kaid,
          userid,
          email
        """
        return self.get_resource("/api/v1/badges", params=params)

    def badges_categories(self):
        """Retrieve a list of all badge categories"""
        return self.get_resource("/api/v1/badges/categories")

    def badges_categories_category(self, category_id):
        """Retrieve specific badge category identified by <category>.
        :param: category_id: An integer representing the category:
          '0' for 'meteorite',
          '1' for 'moon',
          '2' for 'earth',
          '3' for 'sun',
          '4' for 'black hole',
          '5' for 'challenge patch'
        """
        return self.get_resource("/api/v1/badges/categories/" + category_id)

    # EXERCISES
    def exercises(self, tags=[]):
        """Retrieve a filtered list of exercises in the library.
        :param: tags, A comma-separated list of tags to filter on
        """
        return self.get_resource("/api/v1/exercises", params={"tags": tags})

    def exercises_exercise_name(self, name):
        """Retrieve exercise identified by <name>"""
        return self.get_resource("/api/v1/exercises/" + name)

    def exercises_exercise_followup_exercises(self, name):
        """Retrieve all the exercises that list <name> as a prerequisite."""
        return self.get_resource(
            "/api/v1/exercises/%s/followup_exercises" % name
        )

    def exercises_exercise_videos(self, name):
        """Retrieve a list of all videos associated with <name>."""
        return self.get_resource("/api/v1/exercises/%s/videos" % name)

    def exercises_perseus_autocomplete(self):
        """listing of Perseus exercises used for autocomplete."""
        return self.get_resource("/api/v1/exercises/perseus_autocomplete")

    # PLAYLISTS
    def playlists_exercises(self, topic_slug):
        """Retrieve a list of all exercises in the topic id'ed by <topic_slug>."""
        return self.get_resource("/api/v1/playlists/%s/exercises" % topic_slug)

    def playlists_videos(self, topic_slug):
        """Retrieve a list of all videos in the topic id'ed by <topic_slug>."""
        return self.get_resource("/api/v1/playlists/%s/videos" % topic_slug)

    # TOPIC
    def topic(self, topic_slug):
        """Return info about a node in the topic-tree, including its children."""
        return self.get_resource("/api/v1/topic/" + topic_slug)

    def topic_exercises(self, topic_slug):
        """Retrieve a list of all exercises in the topic id'ed by <topic_slug>"""
        return self.get_resource("/api/v1/topic/%s/exercises" % topic_slug)

    def topic_videos(self, topic_slug):
        """Retrieve a list of all videos in the topic identified by <topic_slug>."""
        return self.get_resource("/api/v1/topic/%s/videos" % topic_slug)

    # TOPICTREE
    def topictree(self, kind=None):
        """Retrieve full hierarchical listing of our entire library's topic tree.
        :param: kind, string of topic type
            kind=Topic, returns only topics
            kind=Exercise, returns topics and exercises
        """
        return self.get_resource("/api/v1/topictree", params={"kind": kind})

    # USER. All User methods require authentication
    def user(self, identifier={}):
        """Retrieve data about a user. If no identifier is provided, it will
        return the authenticated user.
        :param: identifier, one of three identifiers:
          username, userid, email
        """
        return self.get_resource("/api/v1/user", params=identifier)

    def user_exercises(self, identifier={}, exercises=[]):
        """Retrieve info about a user's interaction with exercises.
        :param: identifier, on of four identifiers: username, userid, email, kaid
        :param: exercises, optional list of exercises to filter. If none is provided,
        all exercises attempted by user will be returned."""
        return self.get_resource(
            "/api/v1/user/exercises",
            params={"exercises": exercises, **identifier},
        )

    def user_exercises_log(self, exercise, params={}):
        """
        Retrieve a list of ProblemLog entities for one exercise for one user.
        """
        return self.get_resource(
            "/api/v1/user/exercises/%s/log" % exercise, params
        )

    # TODO Finish implementing the user methods

    # VIDEOS
    # TODO implement the videos methods
