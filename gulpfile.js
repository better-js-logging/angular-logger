var gulp = require('gulp'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify');

gulp.task('clean', function () {
    return gulp.src(['dist/*'], {
            read: false
        })
        .pipe(clean());
});

gulp.task('build', ['clean'], function () {
    gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(concat("logger.min.js"))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build'], function () {
    // place code for your default task here
});
