// Functions that do not belong to any particular class. However, they are at
// the core of how React components find DOM elements.
define(["lodash", "jquery"], function(_, $) {
    var helpers = {

        // Since in react attributes have to be either objects or strings
        //  this is a simple function to convert object like:
        // {
        //      "a": true,
        //      "c": false,
        //      "d": true
        // } to "a d" string.
        // Used to dynamically assign classes to element.
        classFromObj: function(obj) {
            return _(obj).map(function(isSet, cssClass) {
                return isSet ? cssClass : null;
            }).filter().value().join(" ");
        },

        addressToElementSelector: function(addr) {
            var selector = "[data-target-spy='";
            selector += addr;
            selector += "']";
            return selector;
        },

        addressToLinkSelector: function(addr) {
            var selector = "[href='";
            selector += addr;
            selector += "']";
            return selector;
        },

        // Needed to avoid confusion between group like /api/v1/user and
        //  actual endpoint /api/v1/user.
        apiGroupToRef: function(str) {
            return "/group" + str;
        },

        // Since http headers are case insensitive we have to uppercase them
        // on our own.
        capitalizeHTTPHeader: function(header) {
            return header.replace(/(?:^|-)./g, function(m) {
                return m.toUpperCase();
            });
        },

        // Performs scrolling. Rather arbitrary threshold of 3500px between
        // animating and jumping.
        scrollTo: function(element) {
            var $window = $(window);
            var $body = $("html, body");
            var scrollTo = $(element).offset().top - 30;

            if (Math.abs($window.scrollTop() - scrollTo) > 3500) {
                $body.scrollTop(scrollTo);
            } else {
                $body.animate({scrollTop: scrollTo});
            }
        },
    };

    return helpers;
});