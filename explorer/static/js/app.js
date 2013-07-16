requirejs.config({
    // By default load any module IDs from js/lib
    baseUrl: "/static/third_party/js",
    // except, if the module ID starts with "app", load it from the js/app
    // directory. Paths config is relative to the baseUrl, and never includes
    // a ".js" extension since the paths config could be for a directory.
    paths: {
        app: "../../js/app",
        jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min"
    },

    "shim": {
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
    }
});

requirejs(["app/views/main"]);
