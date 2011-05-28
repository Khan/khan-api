# Khan Academy API Documentation and Examples

Copyright 2011 Khan Academy

All example code is [MIT licensed](http://en.wikipedia.org/wiki/MIT_License).

## Documentation

* [Full Documentation](https://github.com/kamens/khan-api/wiki)

## Examples

* There's a [small test client](https://github.com/kamens/khan-api/tree/master/examples/test_client ) in this repo that can be used to test your API calls or to serve as an example for implementing our authentication flow.

* To use the test client

- `python test.py`
- Enter your consumer key and secret
- Enter the Khan Academy url you want to test against (unless you're running a local version, this'll be `http://www.khanacademy.org`)
- A browser will pop up for you to walk through the authentication flow. When done, it will redirect you to a page that says "Ok" and in the URL there will be two parameter values you need: `oauth_token` and `oauth_token_secret`.
- Go back to the test.py command line and enter your new token and secret.
- You'll now have a loop that lets you run Khan Academy API queries, authenticated as the user you logged in as.
- Example:

[[http://i.imgur.com/M5h4O.png|frame]]

