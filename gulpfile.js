let gulp = require('gulp');
 	connect = require('gulp-connect');
 	gutil = require('gulp-util');
 	sass = require('gulp-sass');
 	uglify = require('gulp-uglify-es').default;
  concat = require('gulp-concat');
  browserSync = require('browser-sync');

gulp.task('copy', function() {
  gulp.src('index.html')
  .pipe(gulp.dest('assets'))
});

gulp.task('sass', function() {
  gulp.src('styles/main.scss')
  .pipe(sass({style: 'expanded'}))
    .on('error', gutil.log)
  .pipe(gulp.dest('assets'))
});

gulp.task('js', function() {
  gulp.src('scripts/*.js')
  .pipe(uglify())
  .pipe(concat('app.js'))
  .pipe(gulp.dest('assets'))
});

// reloading browsers
gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});
gulp.task('sass-watch', ['sass'], function (done) {
  browserSync.reload();
  done();
});
gulp.task('copy-watch', ['copy'], function (done) {
  browserSync.reload();
  done();
});

// Static Server + watching scss/html files
gulp.task('serve', ['copy', 'sass', 'js'], function() {
  browserSync.init({
    server: "./assets"
  });

  gulp.watch("scripts/*.js", ['js-watch']);
  gulp.watch("styles/*.scss", ['sass-watch']);
  gulp.watch("*.html", ['copy-watch']);
});

gulp.task('start', ['serve']);