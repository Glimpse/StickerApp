'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var eslintConfig = require('./../eslint.config.js');

gulp.task('lint-gateway', function lintGateway() {
    var config = _.assign({
         parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module',
            ecmaFeatures: {
                modules: true,
                jsx: true
            }
        },
        env: {
            node: true,
            es6: true
        }
    }, eslintConfig);

    // note that when we return the stream here, builds from the root (e.g., `gulp lint build`) will
    // write some output to the wrong directory.  I don't understand why, but not returning anything
    // here seems to work around the issue and the build still fails if there is a linter error.
    gulp.src(['./apigateway/**/*.js', '!./apigateway/node_modules/**/*'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint(config))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint-gateway']);

gulp.task('default', ['lint']);

