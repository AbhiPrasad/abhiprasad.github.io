module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js: {
                src: ['src/js/index.js'],
                dest: 'src/release/release.js'
            },
            css: {
                src: ['src/css/style.css'],
                dest: 'src/release/release.css'
            }
        },

        cssmin: {
            css: {
                files: {
                    'dist/style.min.css': 'src/release/release.css'
                }
            }
        },

        uglify: {
            js: {
                files: {
                    'dist/app.min.js': 'src/release/release.js'
                }
            }
        },

        watch: {
            concat: {
                files: ['src/js/index.js', 'src/css/style.css'],
                tasks: ['concat']
            },
            minify: {
                files: ['src/release/*.css', 'src/release/*.js'],
                tasks: ['cssmin', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'cssmin', 'uglify','watch']);
};