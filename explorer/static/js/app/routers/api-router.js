define([
    "backbone"
], function(Backbone) {
    var ApiRouter = Backbone.Router.extend({
        routes: {
            "": "index",
            "group/*group": "group",
            "api/v1/*method": "endpoint"
        },
    });

    return ApiRouter;
});
