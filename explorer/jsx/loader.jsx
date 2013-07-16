/** @jsx React.DOM */
define(["react"], function(React) {
    var Loader = React.createClass({

        render: function() {
            return (
                <div class="loader-box row">
                    <div class="loader-container col-lg-12">
                        <div class="throbber-row clearfix">
                             <div class="block-0 throbber-block"></div>
                             <div class="block-1 throbber-block"></div>
                             <div class="block-2 throbber-block"></div>
                        </div>
                        <div class="throbber-row clearfix">
                             <div class="block-7 throbber-block"></div>
                             <div class="block-8 throbber-block"></div>
                             <div class="block-3 throbber-block"></div>
                        </div>
                        <div class="throbber-row clearfix">
                             <div class="block-6 throbber-block"></div>
                             <div class="block-5 throbber-block"></div>
                             <div class="block-4 throbber-block"></div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    return Loader;
});
