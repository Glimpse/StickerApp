'use strict';

var del = require('del');
var gulp = require('gulp');
var webpack = require('webpack');

gulp.task('clean-client', function cleanClient() {
    del.sync(['./client/dist/**']);
});

gulp.task('build', ['build-client-img', 'build-client-font', 'build-client-dev']);

gulp.task('build-client-img', ['clean-client'], function buildClientImg() {
    return gulp.src('./client/img/**/*')
        .pipe(gulp.dest('./client/dist/img'));
});

gulp.task('build-client-font', ['clean-client'], function buildClientFont() {
    return gulp.src('./client/fonts/**/*')
        .pipe(gulp.dest('./client/dist/fonts'));
});

gulp.task('build-client-html', ['clean-client'], function buildClientHtml() {
    return gulp.src('./client/html/*')
        .pipe(gulp.dest('./client/dist/'));
});

gulp.task('build-client-dev', ['clean-client'], function buildClientDev(cb) {
    webpack(require('./webpack.config.js'), function webpackCallback(err, stats) {
        if (err) {
            return cb(err);
        }

        if (stats.compilation.errors && stats.compilation.errors.length) {
            console.error(stats.compilation.errors);
            return cb(new Error('Webpack failed to compile the application.'));
        }

        cb();
    });
});

gulp.task('default', ['build']);

// TODO this is slow because it blindly rebuilds everything
gulp.task('rebuild-client-js', cb => {
    del.sync(['./client/dist/**/*.js']);
    webpack(require('./webpack.config.js'), (err, stats) => {
        if (err) {
            return cb(err);
        }

        if (stats.compilation.errors && stats.compilation.errors.length) {
            console.error(stats.compilation.errors);
            return cb(new Error('Webpack failed to compile the application.'));
        }

        cb();
    });
});

gulp.task('watch', () => gulp.watch('./client/src/**/*.js', ['rebuild-client-js']));
