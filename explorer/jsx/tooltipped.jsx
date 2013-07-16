/** @jsx React.DOM */
define([
    "react",
    "jquery",
    "tooltip"
], function(React, $) {
    var Tooltipped = React.createClass({
        render: function() {
            return this.props.children;
        },

        componentDidMount: function() {
            $(this.getDOMNode()).tooltip({
                html: true,
                placement: "bottom",
                title: this.props.tooltipContents
            });
        }
    });

    return Tooltipped;
});
