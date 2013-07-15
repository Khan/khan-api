define(["backbone", "lodash", "app/util/helpers"], function(Backbone, _, Helpers) {

    var ApiArgument = Backbone.Model.extend({
        defaults: {
            part_of_url: false,
            required: false,
            name: "",
            description: ""
        },

        url: ""
    });

    var ApiEndpoint = Backbone.Model.extend({
        defaults: {
            returns: "",
            http_method: "",
            description: "",
            access_control: "",
            url: "",
            summary: "",
            example: "",
            arguments: []
        },

        url: "",

        initialize: function(attrs, options) {
            Backbone.Model.prototype.initialize.call(this, attrs, options);

            this.set("arguments",
                _.map(this.get("arguments"), function(argument) {
                    return new ApiArgument(argument);
                })
            );
        },

        /**
         * Breaks down access_control returned by /api/v1/v1_api_descriptions
         * into useful information chunks. access_control is currently one of:
         *  - login-required(child_user_allowed,phantom_user_allowed,...)
         *  - open-access
         *
         * Returns:
         *  {
         *      "login required": [
         *          "child user allowed",
         *          ...
         *      ]
         *  }
         */
        accessControlParts: function() {
            var accessControlDetails = {};
            // Extract extra permission information if the login is required
            var accessParts = this.get("access_control").split("(");

            // access_control didn't get split above1 it is an open-access
            if (accessParts.length !== 1) {
                var extraControl = accessParts[1]
                    .substring(0, accessParts[1].length - 1)
                    .split(",");
                var accessName = accessParts[0].replace(/-/g, " ");

                accessControlDetails[accessName] = _.map(extraControl,
                    function(userCategory) {
                        return userCategory.replace(/_/g, " ");
                });
            } else {
                accessControlDetails["open access"] = ["open access"];
            }

            return accessControlDetails;
        },

        requiresAuth: function() {
            return this.get("access_control").indexOf("login-required") !== -1;
        },

        // Extract first three parts of relative url
        // Returns:
        //  String like /api/v1/exercises
        urlToGroup: function() {
            return this.get("url").split("/").slice(0, 4).join("/");
        },

        // Function to strip Flask specific markup to create nice routes
        // Allows to avoid urlencoding the specified characters
        urlToId: function() {
            var id = this.get("url");
            id = id.replace(/path:/g, "");
            id = id.replace(/[<>]/g, "");
            return id;
        }
    });

    // Collection of ApiEndpoints
    var PublicApi = Backbone.Collection.extend({
        model: ApiEndpoint,
        url: "/api/v1/v1_api_descriptions",

        parse: function(response) {
            return _.map(response, function(endpoint) {
                return new ApiEndpoint(endpoint);
            });
        }
    });

    return {
        ApiArgument: ApiArgument,
        ApiEndpoint: ApiEndpoint,
        PublicApi: PublicApi
    };
});
