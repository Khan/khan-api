/** @jsx React.DOM */
define([
    "react",
    "prism"
], function(React, Prism) {
    var HighlightedCode = React.createClass({
        render: function() {
            return <pre class={this.props.scroll ? "pre-scrollable" : ""}>
                <code ref="code" className={"language-" + this.props.language}>
                    {this.props.children}
                </code>
            </pre>;
        },

        componentDidMount: function() {
            Prism.highlightElement(this.refs.code.getDOMNode());
        }
    });

    return HighlightedCode;
});
