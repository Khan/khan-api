/** @jsx React.DOM */
define([
    "react",
    "lodash",
    "jquery",
    "prism",
    "app/util/helpers",
    "app/util/http-codes",
    "app/views/loader",
    "app/views/highlighted-code"
], function(React, _, $, Prism, Helpers, HTTPCodes, Loader, HighlightedCode) {
    var EndpointArguments = React.createClass({
        getInitialState: function() {
            return {
                loading: false,
                apiResponse: "",
                headers: {},
                revealed: false
            };
        },

        // Highlight response elements
        componentDidUpdate: function() {
            $("body").scrollspy("refresh");
        },

        // Hacky way to deal with response.
        // TODO(robert): This should not be necessary if our API was sane.
        // TODO(robert): Should we inform users about the fact that response
        //  aren't served exactly as sent by the host?
        parseResponse: function(response, contentType) {
            var result = "";
            var contentTypeWithoutCharset = contentType.split(";")[0];
            // Some responses are just huge! just dump them
            if (contentTypeWithoutCharset === "application/json" &&
                response.length < 500000) {
                // Large responses put in DOM kill the browser
                // If a response is a list of something the return
                // only one element at random.
                var jsonResponse = JSON.parse(response);
                result = JSON.stringify(jsonResponse, null, 2);
            } else {
                // Some arbitrary cut-off point
                result = response.slice(0, 100000);
            }

            return result;
        },

        // Some
        parseHeaders: function(headers, status) {
            var headerString = "HTTP/1.1 " + status + " " +
                HTTPCodes[status] + "\n";
            headerString += _.map(JSON.parse(headers), function(value, key) {
                return Helpers.capitalizeHTTPHeader(key) + ": " + value;
            }).sort().join("\n");

            return headerString;
        },

        // Only checks if required arguments are present
        // Future extensions include simple type checking
        validateApiCall: function() {
            return _.reduce(this.props.endpointSpec.get("arguments"),
                function(acc, arg) {
                    if (arg.get("required") &&
                        !this.refs["arg-" + arg.get("name")].getDOMNode().value) {
                        return false
                    }
                    return acc;
            }, true, this);
        },


        // Substitute elements in Flask like route with values
        replaceInUrlData: function() {
            var url = this.props.endpointSpec.get("url");
            _.each(this.props.endpointSpec.get("arguments"),
                function(arg) {
                    if (arg.get("part_of_url")) {
                        // url will contain Flask specific options
                        // currently only "path:" is present
                        var regexp = new RegExp("<[^>]*" + arg.get("name") +
                            ">", "g");
                        url = url.replace(regexp, this.refs["arg-" + arg.get("name")]
                            .getDOMNode().value);
                    }
            }, this);

            return url;
        },

        // All arguments that are not required by url are gathered
        //  by this function.
        populateNonUrlData: function() {
            return _.reduce(this.props.endpointSpec.get("arguments"),
                function(acc, arg) {
                    if (!arg.get("part_of_url")) {
                        acc[arg.get("name")] = this.refs["arg-" + arg.get("name")]
                            .getDOMNode().value;
                    }
                    return acc;
            }, {}, this)
        },

        // Handle api call
        // TODO(robert): Should we do something when user tries to submit
        //  invalid request instead of nothing?
        apiCall: function(event) {
            if (this.validateApiCall()) {
                var spec = this.props.endpointSpec;
                this.setState({loading: true});
                $.ajax({
                    url: this.replaceInUrlData(),
                    type: spec.get("http_method"),
                    data: this.populateNonUrlData(),
                    dataType: "text"
                }).done(_.bind(function(data, textStatus, jqXHR) {
                    this.setState({
                        apiResponse: this.parseResponse(jqXHR.responseText,
                            jqXHR.getResponseHeader("Content-Type")),
                        headers: this.parseHeaders(
                            jqXHR.getResponseHeader("X-Original-Headers"),
                            jqXHR.getResponseHeader("X-Original-Status")),
                        loading: false
                    });
                }, this));
            }
            return false;
        },

        // Animate expanding of api call form
        revealCallForm: function(event) {
            if (!this.state.revealed) {
                var $node = $(this.getDOMNode());
                var minHeight = $node.outerHeight(false);
                // Min-height overrides height and allows us to use slideDown
                // for partially visible element
                $node.css({display: "none", "min-height": minHeight,
                    "height": "auto"});

                // Only downside of slideDown is that it also animates padding
                // and margin. Css of $node has margin and padding fixed with
                // !important to avoid this.
                $node.slideDown({
                    step: _.bind(function(value, tween) {
                        // slideDown animates from 0 to height, however,
                        // the element has some height from the start
                        // we hide the overlay once the animation has passed
                        // the threshold set by min-height.
                        if (tween.prop === "height") {
                            if (!this.state.revealed && value >= minHeight) {
                                this.setState({revealed: true});
                            }
                        }
                    }, this),
                    done: _.bind(function() {
                        $(this.refs.hide.getDOMNode()).slideDown();
                        $node.attr("style", "");
                    }, this)
                });
            }
        },

        // Handle collapsing. This and above function cannot be merged together
        // since when expanded whole field should not be clickable.
        hideCallForm: function(event) {
            if (this.state.revealed) {
                var $node = $(this.getDOMNode());
                $(this.refs.hide.getDOMNode()).slideUp({duration: 300});
                $node.animate({height: "30px"}, {
                    done: _.bind(function() {
                        $node.css("height", "");
                        this.setState({revealed: false});
                    }, this)
                })
            }
        },

        // Build single input field
        buildInputField: function(arg) {
            if (arg) {
                var classes = {
                    "required": arg.get("required")
                };

                var spanClasses = _.extend({
                    "glyphicon": true,
                    "glyphicon-asterisk": true
                }, classes);

                return [<div class="col-lg-6">
                    <span class={Helpers.classFromObj(spanClasses)}></span>
                    <input type="text" name={arg.get("name")}
                        ref={"arg-" + arg.get("name")}
                        placeholder={arg.get("name")}
                        class={Helpers.classFromObj(classes)}/>
                </div>, <div class="col-lg-6 description">
                    <small>
                        {arg.get("description")}
                    </small>
                </div>];
            } else {
                return [<div class="col-lg-6"></div>,
                    <div class="col-lg-6 description"></div>];
            }
        },

        // Build row of input form.
        buildFormRow: function(previousArg, currentArg) {
            var inputPrevious = this.buildInputField(previousArg);
            var inputCurrent = this.buildInputField(currentArg);
            return  (
                <div class="row arg">
                    <div class="row">
                        {inputPrevious[0]}
                        {inputCurrent[0]}
                    </div>
                    <div class="row">
                        {inputPrevious[1]}
                        {inputCurrent[1]}
                    </div>
                </div>
            );
        },

        render: function() {
            var argsArray = _.toArray(
                this.props.endpointSpec.get("arguments"));
            var argsForm = [];
            for (var i = 0; i < argsArray.length; i += 2) {
                argsForm.push(
                    this.buildFormRow(argsArray[i], argsArray[i + 1]));
            }

            var form = <form class="form-horizontal col-12 col-lg-12">
                {argsForm}
                <div class="row">
                    <div class="try-button col-lg-8 col-offset-2">
                        <input type="submit" value="Try it" onClick={this.apiCall}
                            class="btn btn-api-action btn-large btn-block"/>
                    </div>
                </div>
            </form>;

            var login = <div />;
            if (!this.props.isLoggedIn && this.props.endpointSpec.requiresAuth()) {
                var loginScrollBack = "/oauth_get_request_token?continue=" +
                    encodeURIComponent(this.props.parentId.slice(1));

                login = <div class="login-box col-lg-12">
                    <div class="row">
                        <div class="col-lg-8 col-offset-2">
                           <a href={loginScrollBack} data-bypass
                                class="btn btn-login btn-large btn-block">
                                Login
                            </a>
                        </div>
                    </div>
                </div>;
            }

            // Add response if user made a call or loader is call is
            //  in progress
            var response = <div />;
            if (this.state.loading) {
                response = <Loader />;
            } else if (!this.state.loading && this.state.apiResponse) {
                response = <div class="api-response col-lg-12">
                    <div class="row">
                        <div class="col-lg-12">
                            <HighlightedCode language="http" scroll={true}>
                                {this.state.headers}
                            </HighlightedCode>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <HighlightedCode language="json" scroll={true}>
                                {this.state.apiResponse}
                            </HighlightedCode>
                        </div>
                    </div>
                </div>;
            }

            var hide = <div ref="hide" onClick={this.hideCallForm}
                class="arguments-hide" style={{display: 'none'}}>Hide</div>;

            var classes = {
                row: true,
                arguments: true,
                reveal: !this.state.revealed
            };

            return (
                <div class={Helpers.classFromObj(classes)} onClick={this.revealCallForm}>
                    {login}
                    {form}
                    {response}
                    {hide}
                </div>
            );
        }
    });

    return EndpointArguments;
});
