# PHP Test Client

Simple PHP server that can connect to the Khan Academy API using version 175 of
the oauth-php library.

## Getting Started
First, modify the variables `$consumerKey`, `$consumerSecret`, and possibly
`$loginCallback` at the top of `ka_client.php` to the values you want to use.

Then run a PHP server on the hostname and port from `$loginCallback`. For
example:
```
php -S localhost:8001 -t .
```

Then load `http://localhost:8001/ka_client.php` and log in. If the login is
successful, it should redirect you to a page that lets you make GET requests
against the KA API.

This example is based off of the Google Docs oauth-php example at
`oauth-php/example/client/googledocs.php`, and it uses OAuthStoreSession. When
running in production, the oauth-php documentation recommends you use database
storage (e.g. OAuthStoreMySQL) instead.
