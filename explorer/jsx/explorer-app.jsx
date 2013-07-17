/** @jsx React.DOM */
define([
    "react",
    "lodash",
    "app/views/menu",
    "app/views/public-api",
    "app/routers/api-router"
], function(React, _, Menu, PublicAPI, ApiRouter) {
    var ExplorerApp = React.createClass({
        componentDidMount: function() {
            this.props.router.on("route:group", this.routeGroup);
            this.props.router.on("route:endpoint", this.routeEndpoint);
        },

        componentWillUnmount: function() {
            this.props.router.off("route:group", this.routeGroup);
            this.props.router.off("route:endpoint", this.routeEndpoint);
        },

        routeGroup: function(group) {
            group = "/" + group;
            this.refs.publicAPI.revealGroup(group);
        },

        routeEndpoint: function(method) {
            method = "/api/v1/" + method;
            this.refs.publicAPI.revealEndpoint(method);
        },

        onMenuGroupClick: function(group) {
            this.refs.publicAPI.revealGroup(group);
            this.props.router.navigate("/group" + group);
            return false;
        },

        onMenuEndpointClick: function(method) {
            this.refs.publicAPI.revealEndpoint(method);
            this.props.router.navigate(method);
            return false;
        },

        render: function() {
            return <div class="row">
                <div class="col-lg-4">
                    <Menu ref="menu"
                        urls={this.props.apiCollection}
                        onGroupClick={this.onMenuGroupClick}
                        onEndpointClick={this.onMenuEndpointClick} />
                </div>
                <div class="col-lg-8 vertical-divider">
                    <PublicAPI ref="publicAPI"
                        endpoints={this.props.apiCollection}
                        isLoggedIn={this.props.isLoggedIn} />
                </div>
            </div>;
        }
    });

    return ExplorerApp;
});
