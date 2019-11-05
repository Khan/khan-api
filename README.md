# Khan Academy API

**Deprecation notice**: we have recently improved our site's usage-time-tracking capabilities, and are no longer planning to support the old form of this data that is provided via this API. All usage-time-related fields (e.g. `time_taken`, `total_seconds_watched`, etc.) will be removed as of Nov 30 2019. However, you can find new reports featuring our new and improved usage-time in your Progress tab and in the Teacher Tools section of the khanacademy.org site.

**Removal notice**: On January 6, 2020, we will be removing many of the Khan Academy APIs. The remaining endpoints will be removed on July 1, 2020. See timing for specific endpoints below.
In the future, if you’re looking for information about the progress of your students or children, check out the reports available from Teacher Dashboard section of our site.

Removal timing:

| **Endpoints**       | **When removed:**     |
|---------------------|-----------------------|
| /api/v1/badges/*    | January 6, 2020       |
| /api/v1/user/*      | January 6, 2020       |
| /api/v1/playlists/* | January 6, 2020       |
| /api/v1/topictree   | July 1, 2020          |
| /api/v1/topic/*     | July 1, 2020          |
| /api/v1/videos/*    | July 1, 2020          |
| /api/v1/exercises/* | July 1, 2020          |

This repository provides documentation and some examples for working with the Khan Academy API.

## Documentation

Documentation can be found on the GitHub project wiki:

* The [Khan Academy API](https://github.com/Khan/khan-api/wiki/Khan-Academy-API) wiki page has general information about how to use the API.
* The [Khan Academy API Authentication](https://github.com/Khan/khan-api/wiki/Khan-Academy-API-Authentication) wiki page provides more detailed documentation about how to use OAuth 1 to log in as a Khan Academy user and access information.

Unfortunately, not all of the documentation is completely up-to-date, so feel free to file issues if documentation looks wrong or incomplete.

## Asking questions and reporting bugs

Please Note: We are no longer actively developing or maintaining this API. It is offered for public use as is.

If you have a question about how to use the API, there are a few ways you can get support:

* You can ask a StackOverflow question with the [khan-academy](https://stackoverflow.com/tags/khan-academy) tag. We watch for new issues with that tag, and you're also likely to get help from other community members.
* You can file an issue in the issue tracker for this GitHub project. This is especially useful if you find a bug in one of the sample clients or with the API itself.
* If you already have a contact at Khan Academy (e.g. through a partnership), you can reach out to them.

Unfortunately, we're not always actively developing and maintaining the API, so we're unlikely to add significant features and may be slow at responding to questions, but we try to get to every question and we hope you'll still find the existing API useful.

## Sample API clients

See the [examples](https://github.com/Khan/khan-api/tree/master/examples) directory for a few sample API clients. All example code is [MIT licensed](http://en.wikipedia.org/wiki/MIT_License).

The most current example client is `test_client2`, which shows how to connect using the `/api/auth2` authentication endpoints.

Here's an example of how you might use it (using the consumer key and secret obtained when [registering an app](https://www.khanacademy.org/api-apps/register)):

```
$ cd examples/test_client2
$ python test.py
consumer key: [your consumer key]
consumer secret: [your consumer secret]
server base url: https://www.khanacademy.org

Resource relative url (e.g. /api/v1/playlists): /api/v1/user


{"spawned_by": null, "total_seconds_watched": 140627, ...}

Time: 0.647733926773s
```

## Contributing

If you want to contribute your own sample client, we'd be happy to include it; just send us a pull request! There's also plenty of room for improvement in the existing clients, so we're happy to accept contributions to those as well.
