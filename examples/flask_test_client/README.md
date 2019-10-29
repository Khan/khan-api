## Usage
This example shows how to incorporate the Khan Academy API into your Flask web app. It assumes that you are already
familiar with Flask, and have set up the server with some endpoints. It is not meant to be used as a stand alone client.

The main file in this example is `khan_api.py`. `server.py` is just an example of how to incorporate it into your
Flask project. But, if you are looking to bootstrap a new project, you could start off with `server.py` and modify
it to your needs.

If you are only looking to get data for your students, and don't need an HTTP server that will let users interact with their
data, you may be interested in a simple wrapper for the API like https://github.com/jb-1980/khan_api_wrapper.

### Step 1:
Import the `KhanAcademySignIn` and `KhanAPI` classes into your project:
```python
from khan_api import KhanAcademySignIn, KhanAPI
```

### Step 2:
Set up an endpoint in your Flask server that will handle the user authorization. This could be something like `/login`
or `/authorize`. Note that in the example's `server.py` file, I use the endpoint `/oauth_authorize`. Then all you have
to do in this endpoint is instantiate the `KhanAcademySignIn` class and use the `authorize` method. Here is the code snippet
from `server.py`:

```python
@app.route("/oauth_authorize")
def oauth_authorize():
    oauth = KhanAcademySignIn()
    return oauth.authorize()
```

### Step 3:
Now we need an endpoint to serve as the callback url that we include in our `KhanAcademySignIn`. This is the url that Khan
will redirect to after the user has authorized the application, and it is the endpoint where we will be able to retrieve the
`access_token` and `access_secret` that we can use to make calls to protected API endpoints at Khan Academy. Again, all we
need to do is instantiate the `KhanAcademySignIn` class and use the `callback` method to get the token and secret. Here is
the code snippet from `server.py`:

```python
@app.route("/oauth_callback")
def oauth_callback():
    oauth = KhanAcademySignIn()
    access_token, access_token_secret = oauth.callback()

    # This is a function you would create to store the tokens somewhere. This could be in a session
    # or cookie variable or even in a database. server.py uses the naive example of storing it in
    # a json file, which you would never do in a production app.
    set_access_tokens(access_token, access_token_secret)

    return redirect(url_for("index"))
```

**Note**: The function `oauth_callback` is hardcoded into the `KhanAcademySignIn` class. (See line 65 of `khan_api.py`). If
your callback endpoint has a different function name, be sure to update the value in `khan_api.py`.

In the above function we have processed the params returned from Khan Academy to get the `access_token` and `access_secret`.
You will then want to store those to use in future requests to your application.

### Step 4:
Use the `access_token` and `access_secret` in your app. It is probably best to create a function that will retrieve the tokens
from your storage area so you can just include the function in your other endpoints like:

```python
...
# Inside of another route in your Flask project.
access_token, access_secret = get_access_tokens()
kapi = KhanAPI(access_token, access_secret)
user = kapi.user()
# Do something with the user data, or just return it to the user.
...
```

Once you have retrieved your token and secret from storage, use them to instantiate the `KhanAPI` class like
`kapi = KhanAPI(token, secret)`. Then you can use the various methods to access protected user data. See, for example,
the `user` method in `khan_api.py`.
