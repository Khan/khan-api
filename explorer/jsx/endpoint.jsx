/** @jsx React.DOM */
define([
    "react",
    "jquery",
    "lodash",
    "app/util/helpers",
    "app/views/endpoint-arguments",
    "app/views/highlighted-code",
    "app/views/tooltipped"
], function(React, $, _, Helpers, Arguments, HighlightedCode, Tooltipped) {
    var Endpoint = React.createClass({
        getInitialState: function() {
            return {
                collapsed: true
            };
        },

        show: function() {
            var content = this.refs.content.getDOMNode();
            $(content).show();
            this.setState({collapsed: false});
            $("body").scrollspy("refresh");
        },

        reveal: function() {
            if (this.state.collapsed) {
                this.showAnimated();
            }
            Helpers.scrollTo(this.getDOMNode());
        },

        toggleAnimated: function() {
            if (this.state.collapsed) {
                this.showAnimated();
            } else {
                this.hideAnimated();
            }
        },

        showAnimated: function() {
            var content = this.refs.content.getDOMNode();
            this.setState({collapsed: false});
            $(content).slideDown(function() {
                $("body").scrollspy("refresh");
            });
        },

        hideAnimated: function() {
            var content = this.refs.content.getDOMNode();
            $(content).slideUp(function() {
                this.setState({collapsed: true});
                $("body").scrollspy("refresh");
            }.bind(this));
        },

        render: function() {
            var classesObj = {panel: true, endpoint: true, collapsed: this.state.collapsed};
            var spyHref = this.props.endpoint.urlToId();
            var accessControl = this.props.endpoint.accessControlParts();
            var tooltipContents = "<p class='no-margin'>" +
                _.values(accessControl)[0].join("</p><p class='no-margin'>") +
                "</p>";
            var badgeClass = "access-control label pull-right " +
                _.keys(accessControl)[0].replace(/ /g, "-");

            return (
                <div data-target-spy={spyHref}
                    class={Helpers.classFromObj(classesObj)}>
                    <div class="panel-heading clearfix" onClick={this.toggleAnimated}>
                        <span class="pull-left">
                            {this.props.endpoint.get("url")}
                        </span>
                        <div class="pull-right">
                            <span class="http-method label label-endpoint
                                pull-right">
                                {this.props.endpoint.get("http_method")}
                            </span>
                            <Tooltipped tooltipContents={tooltipContents}>
                                <span class={badgeClass}>
                                    {_.keys(accessControl)[0]}
                                </span>
                            </Tooltipped>
                        </div>
                    </div>
                    <div ref="content" class="panel-content"
                            style={{display: "none"}}>
                        <Arguments endpointSpec={this.props.endpoint}
                             isLoggedIn={this.props.isLoggedIn}
                             parentId={spyHref}/>
                        <p class="lead">
                            {this.props.endpoint.get("summary")}
                        </p>
                        <p>{this.props.endpoint.get("description")}</p>
                        <dl>
                            <dt>Returns</dt>
                            <dd>{this.props.endpoint.get("returns")}</dd>
                        </dl>
                        <HighlightedCode language="json" scroll={false}>
                            {this.props.endpoint.get("example")}
                        </HighlightedCode>
                    </div>
                </div>
            );
        }
    });

    return Endpoint;
});
