/** @jsx React.DOM */
define([
    "react",
    "app/models/api-models",
    "app/views/loader",
    "app/views/explorer-app",
    "app/routers/api-router"
], function(React, models, Loader, App, ApiRouter) {
    var content = document.getElementById("content");
    React.renderComponent(<Loader />, content);

    var apiCollection = new models.PublicApi();
    apiCollection.fetch({reset: true});

    apiCollection.on("sync", function() {
        var router = new ApiRouter();
        React.renderComponent(
            <App router={router} apiCollection={apiCollection}
                isLoggedIn={window.explorer.isLoggedIn} />,
            content
        );
        Backbone.history.start({pushState: true, root: "/"});
    });
});
