var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var cover = require('gulp-coverage');
var coveralls = require('gulp-coveralls');

gulp.task('clean', function() {
    return gulp.src(['dist/*', 'reports', 'debug'], { read: false })
        .pipe(clean());
});

gulp.task('build', ['clean'], function() {
    gulp.src(['src/logging-enhancer.js', 'src/angular-logger.js'])
        .pipe(uglify())
        .pipe(concat("logger.min.js"))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['build'], function () {
    gulp.src('spec/**/*spec.js')
            .pipe(cover.instrument({
                pattern: ['src/**/*.js'],
                debugDirectory: 'debug'
            }))
            .pipe(jasmine({includeStackTrace: true}))
            .pipe(cover.gather())
            .pipe(cover.format(['html', 'lcov']))
            .pipe(gulp.dest('reports'));

    gulp.src('reports/lcov.info').pipe(coveralls());
});

gulp.task('default', ['build'], function() {
    // place code for your default task here
});