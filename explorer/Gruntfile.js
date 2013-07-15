module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    stylus: {
        css: {
            options: {
                paths: ["css"],
                use: [require("nib")],
            },
            files: {
                "static/css/styles.css": "src/css/*.styl"
            }
        }
    },

    bgShell: {
        _defaults: {
            bg: false
        },
        server: {
            cmd: "./explorer.py -d"
        },
        watch: {
            cmd: "grunt watch",
            bg: true
        },
        jsx: {
            cmd: "node_modules/.bin/jsx src/jsx/ build/js/"
        }
    },

    watch: {
        css: {
            files: ["src/css/**/*.styl"],
            tasks: ["stylus"]
        },
        js: {
            files: ["src/js/**/*.js", "src/js/*.js"],
            tasks: ["copy"]
        },
        jsx: {
            files: ["src/jsx/**/*.jsx"],
            tasks: ["bgShell:jsx"]
        },
        output: {
            files: ["static/**/*", "templates/**/*"],
            options: {
                livereload: true
            }
        }
    },

    clean: ["./build", "static/css/styles.css", "static/js/app", "static/js/app.js"],

    copy: {
        js: {
            files: [{
                expand: true,
                cwd: "src/js/",
                src: ["**/!(app).js"],
                dest: "static/js/app"
            }, {
                src: "src/js/app.js",
                dest: "static/js/app.js"
            }]
        }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-bg-shell");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-stylus");

  // Default task(s).
  grunt.registerTask("build", ["clean", "stylus", "bgShell:jsx", "uglify"]);
  grunt.registerTask("default", ["bgShell:watch", "bgShell:server"]);

};