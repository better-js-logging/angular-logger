var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');

gulp.task('clean', function() {
    return gulp.src(['dist/*'], { read: false })
        .pipe(clean());
});

gulp.task('build', ['clean'], function() {
    gulp.src(['src/logging-enhancer.js', 'src/angular-logger.js'])
        .pipe(uglify())
        .pipe(concat("logger.min.js"))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['build'], function () {
  return gulp.src('spec/**/*spec.js')
        .pipe(jasmine({includeStackTrace: true}));
});

gulp.task('default', ['build'], function() {
    // place code for your default task here
});