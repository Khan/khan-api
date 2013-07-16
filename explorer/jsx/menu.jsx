/** @jsx React.DOM */
define([
    "react",
    "lodash",
    "jquery",
    "app/util/helpers",
    "scrollspy",
    "affix"
], function(React, _, $, Helpers) {
    var ExplorerMenu = React.createClass({

        // Bootstrap plugins
        componentDidMount: function() {
            $(this.getDOMNode()).affix({offset: {
                // Heights of header and footer. Though bottom is not
                // totally convincing.
                top: 369,
                bottom: 360
            }});
            $("body").scrollspy({target: ".sidebar", offset: -369});
        },

        componentDidUpdate: function() {
            $("body").scrollspy("refresh");
        },

        render: function() {
            var links = _(this.props.urls.models).groupBy(function(apiModel) {
                return apiModel.urlToGroup();
            }).map(function(group, groupName) {
                var groupLinks = _.map(group, function(apiModel) {
                    var href = apiModel.urlToId();
                    var handler = this.props.onEndpointClick.bind(this, href);

                    return <li key={href}>
                        <a href={href} onClick={handler}>
                            {apiModel.get("url")}
                        </a>
                    </li>;
                }, this);

                var href = Helpers.apiGroupToRef(groupName);
                var handler = this.props.onGroupClick.bind(this, groupName);

                return <li key={href}>
                    <a href={href} onClick={handler}>
                        {groupName}
                    </a>
                    <ul class="nav">{groupLinks}</ul>
                </li>;
            }, this).value();

            return <div class="sidebar">
                <ul class="nav sidenav">{links}</ul>
            </div>;
        }
    });
    return ExplorerMenu;
});
