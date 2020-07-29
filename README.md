# Khan Academy API

**Deprecation notice**: we have recently improved our site's usage-time-tracking capabilities, and are no longer planning to support the old form of this data that is provided via this API. All usage-time-related fields (e.g. `time_taken`, `total_seconds_watched`, etc.) will be removed as of Nov 30 2019. However, you can find new reports featuring our new and improved usage-time in your Progress tab and in the Teacher Tools section of the khanacademy.org site.

**Removal notice**: On January 6, 2020, we will be removing many of the Khan Academy APIs. The remaining endpoints will be removed on July 1, 2020. See timing for specific endpoints below.
In the future, if you’re looking for information about the progress of your students or children, check out the reports available from Teacher Dashboard section of our site.

Removal timing:

| **Endpoints**       | **When removed:**     |
|---------------------|-----------------------|
| /api/v1/badges/*    | January 6, 2020       |
| /api/v1/user/*      | January 6, 2020       |
| /api/v1/playlists/* | July 29, 2020         |
| /api/v1/topictree   | July 29, 2020         |
| /api/v1/topic/*     | July 29, 2020         |
| /api/v1/videos/*    | July 29, 2020         |
| /api/v1/exercises/* | July 29, 2020         |

If you have any questions, please contact our Support Center: https://khanacademy.zendesk.com/hc/en-us.
