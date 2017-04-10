'use strict';

var _ = require('lodash');
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var webpack = require('webpack');

gulp.task('populate-mongodb', function populateMongoDb(cb) {
    process.argv.push('--config', path.join(__dirname, 'config.mongodb.json'));
    var mongo = require('./server/db/sources/mongodb');
    mongo.initializeDatabase(function onDatabaseInitialized() {
        console.log('Database has been initialized');
        cb();
    });
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

gulp.task('clean-client', function cleanClient() {
    del.sync(['./client/dist/**']);
});

gulp.task('clean', ['clean-client']);

gulp.task('default', ['build-client-dev', 'build-client-img', 'build-client-font', 'build-client-html']);

gulp.task('ci', ['build']);
