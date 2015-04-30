var gulp   = require('gulp'),gu
    gutil  = require('gulp-util'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    minify = require('gulp-minify-css');

gulp.task('default', function() {
    return gutil.log('Gulp is running!');
});

gulp.task('build', function() {
    gulp.src('src/js/chaynsEditor.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist/js'));

    gulp.src('src/css/chaynsEditor.css')
        .pipe(minify())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/css'));

    gulp.src('src/js/*.js')
        .pipe(gulp.dest('dist/js'));

    gulp.src('src/css/*.css')
        .pipe(gulp.dest('dist/css'));
});

gulp.task('qa', function() {
    gulp.src('dist/js/*.js').pipe(gulp.dest('//chayns1/SlitteRessource/ChaynsEditor/js/qa'));
    gulp.src('dist/css/*.css').pipe(gulp.dest('//chayns1/SlitteRessource/ChaynsEditor/css/qa'));
});

gulp.task('release', function() {
    gulp.src('dist/js/*.js').pipe(gulp.dest('//chayns1/SlitteRessource/ChaynsEditor/js'));
    gulp.src('dist/css/*.css').pipe(gulp.dest('//chayns1/SlitteRessource/ChaynsEditor/css'));
});
