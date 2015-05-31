var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var cover = require('gulp-coverage');
var coveralls = require('gulp-coveralls');
var lazypipe = require('lazypipe');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var size = require('gulp-size');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');

// globally handle all missed error events
var gulp_src = gulp.src;
gulp.src = function() {
    return gulp_src.apply(gulp, arguments).pipe(plumber(function(error) {
        gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }));
};

gulp.task('clean', function() {
    del(['dist/*', 'reports', 'debug', '.coverdata', '.coverrun']);
});

gulp.task('browserify', function() {
    return browserify({entries: ['./src/angular-logger.js']}).bundle()
        .pipe(source('angular-logger-browserified.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./debug/'));
});

gulp.task('analyse', function() {
    gulp.src(['./src/angular-logger.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['clean', 'analyse', 'browserify'], function() {
    return gulp.src(['debug/**/*.js'])
        .pipe(concat("angular-logger.js"))
        .pipe(size('test'))
        .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['build'], function() {
    return gulp.src(['debug/**/*.js'])
        .pipe(uglify())
        .pipe(concat("angular-logger.min.js"))
        .pipe(size())
        .pipe(gulp.dest('dist'));
});

var testAndGather = lazypipe()
    .pipe(cover.instrument, { pattern: ['dist/angular-logger.js'], debugDirectory: 'debug' })
    .pipe(jasmine, { includeStackTrace: true })
    .pipe(cover.gather);

gulp.task('test', ['build'], function() {
    gulp.src('spec/**/*spec.js')
        .pipe(testAndGather())
        .pipe(cover.format(['html']))
        .pipe(gulp.dest('reports/coverage'));
});

gulp.task('travis', ['build'], function() {
    gulp.src('spec/**/*spec.js')
        .pipe(testAndGather())
        .pipe(cover.format(['lcov']))
        .pipe(coveralls());
});

gulp.task('report', ['clean', 'test'], function() {
    gutil.log(gutil.colors.green('reports will be generated in ./reports'));
});
gulp.task('default', ['report'], function() {});