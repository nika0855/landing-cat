const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const autoprefixer = require('gulp-autoprefixer');
const spritesmith = require('gulp.spritesmith');
const rimraf = require('rimraf');
const rename = require('gulp-rename');

/* -------- Server  -------- */
gulp.task('server', function() {
  browserSync.init({
    server: {
      port: 9000,
      baseDir: "build"
      
    },
    browser: "chrome"
  });

   gulp.watch('build/**/*').on('change', browserSync.reload);
});

/* ------------ Pug compile ------------- */
gulp.task('templates:compile', function buildHTML() {
  return gulp.src('source/template/*.pug')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Pug',
          message: err.message
          }
        })
      }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('build'))
});

/* ------------ Styles compile ------------- */
gulp.task('styles:compile', function () {
  return gulp.src('source/styles/main.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Styles',
          message: err.message
          }
        })
      }))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
    .pipe(rename('main.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/css'));
    
});

/* ------------ Sprite ------------- */
gulp.task('sprite', function(cb) {
  const spriteData = gulp.src('source/images/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: 'sprite.scss'
  }));

  spriteData.img.pipe(gulp.dest('build/images/'));
  spriteData.css.pipe(gulp.dest('source/styles/global/'));
  cb();
});

/* ------------ Delete ------------- */
gulp.task('clean', function del(cb) {
  return rimraf('build', cb);
});

/* ------------ Copy fonts ------------- */
gulp.task('copy:fonts', function() {
  return gulp.src('./source/fonts/**/*.*')
    .pipe(gulp.dest('build/fonts'));
});

/* ------------ Copy images ------------- */
gulp.task('copy:images', function() {
  return gulp.src('./source/images/**/*.*')
    .pipe(gulp.dest('build/images'));
});

/* ------------ Copy ------------- */
gulp.task('copy', gulp.parallel('copy:fonts', 'copy:images'));

/* ------------ Watchers ------------- */
gulp.task('watch', function() {
  gulp.watch('source/template/**/*.pug', gulp.series('templates:compile'));
  gulp.watch('source/styles/**/*.scss', gulp.series('styles:compile'));
});

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('templates:compile', 'styles:compile', 'copy'),
  gulp.parallel('watch', 'server')
  )
);
