'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        watch: {
            clientCSS: {
                files: 'assets/css/style.css',
                options: {
                    livereload: true
                }
            },
            clientLESS: {
                files: ['scss/*.scss', 'scss/**/*.scss'],
                tasks: ['sass']
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'assets/css/style.css': 'scss/style.scss'
                }
            }
        }
    });

    grunt.registerTask('default', ['sass', 'watch']);
};