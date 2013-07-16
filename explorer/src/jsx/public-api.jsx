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
            var apiMethods = _(this.props.endpoints.models).groupBy(function(apiModel) {
                return apiModel.urlToGroup();
            }).map(_.bind(function(group, groupName) {
                var endpoints = _.map(group, _.bind(function(apiModel) {
                    return <Endpoint endpoint={apiModel}
                        isLoggedIn={this.props.isLoggedIn}
                        routerLoaded={this.props.routerLoaded}/>;
                }, this));
                return (
                    <div class="doc-section">
                        <h1 data-target-spy={Helpers.apiGroupToRef(groupName)}>
                            {groupName.split("/").pop()}
                        </h1>
                        {endpoints}
                    </div>
                );
            }, this)).value();

            return (
                <div class="docs">
                    {apiMethods}
                </div>
            );
        }
    });

    return PublicAPI;
});
