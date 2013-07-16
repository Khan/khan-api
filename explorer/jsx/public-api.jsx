/** @jsx React.DOM */
define([
    "react",
    "lodash",
    "jquery",
    "app/util/helpers",
    "app/views/endpoint",
    "jquery.placeholder"
], function(React, _, $, Helpers, Endpoint) {
    var PublicAPI = React.createClass({
        componentDidMount: function() {
            $('input, textarea').placeholder();
        },

        render: function() {
            var apiMethods = _(this.props.endpoints.models).groupBy(
                function(apiModel) {
                    return apiModel.urlToGroup();
            }).map(function(group, groupName) {
                var endpoints = _.map(group, function(apiModel) {
                    return <Endpoint
                        ref={"endpoint" + apiModel.urlToId()}
                        endpoint={apiModel}
                        isLoggedIn={this.props.isLoggedIn}
                        routerLoaded={this.props.routerLoaded}/>;
                }, this);

                var components = groupName.split("/");
                var header = components[components.length - 1];

                return <div ref={"group" + groupName} class="doc-section">
                    <h1 data-target-spy={Helpers.apiGroupToRef(groupName)}>
                        {header}
                    </h1>
                    {endpoints}
                </div>;
            }, this).value();

            return <div class="docs">
                {apiMethods}
            </div>;
        },

        revealEndpoint: function(method) {
            var endpoint = this.refs["endpoint" + method];
            endpoint.reveal();
        },

        revealGroup: function(group) {
            this.props.endpoints.each(function(apiModel) {
                if (apiModel.urlToGroup() === group) {
                    var endpoint = this.refs["endpoint" + apiModel.urlToId()];
                    endpoint.show();
                }
            }, this);

            var groupEl = this.refs["group" + group].getDOMNode();
            Helpers.scrollTo(groupEl);
        }
    });

    return PublicAPI;
});
