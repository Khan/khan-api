({
    out: "static/js/main.js",
    baseUrl: "static/third_party/js",
    paths: {
        app: "../../js/app"
    },

    shim: {
        "lodash": {
            exports: "_"
        },
        "scrollspy": ["jquery"],
        "affix": ["jquery"],
        "tooltip": ["jquery"],
        "prism": {
            exports: "Prism"
        },
        "react": ["es5-shim"],
        "backbone": {
            deps: ["jquery", "lodash"],
            exports: "Backbone"
        },
        // Placeholder fix for IE8 and 9
        "jquery.placeholder": ["jquery"]
    },
    name: "app",
    preserveLicenseComments: false
})
