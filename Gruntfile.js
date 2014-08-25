/*global module:false*/
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    connect: {
      server: {},
      sample: {
        options: {
          port: 5555,
          keepalive: true
        }
      }
    }
  });
};