'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const del = require('del');
const SSH = require('gulp-ssh')
const fs = require('fs');
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const ts = require('gulp-typescript');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const siteRoot = '/home/1001v/web/1001v.ru/public_html/porno';

var gulpSSH = new SSH({
    ignoreErrors: false,
    sshConfig: {
        host: 'ssh.1001v.ru',
        port: 22,
        username: '1001v',
        privateKey: fs.readFileSync('/home/artem/.ssh/id_rsa2')
    }
})

gulp.task('styles', function() {

    return gulp.src('src/sass/**/**.scss')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({ outputStyle: isDevelopment ? 'expanded' : 'compressed' }).on('error', notify.onError("Error compiling scss")))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(autoprefixer())
        .pipe(gulp.dest('assets/css'));

});

gulp.task('html', function() {
    return gulp.src('src/html/*.html')
        .pipe(htmlmin({ collapseWhitespace: !isDevelopment }))
        .pipe(gulp.dest('assets/html'));
});

gulp.task('js', function() {

    return gulp.src('src/js/**/**.js')
        .pipe(babel({
            presets: ['es2015'],
            minified: !isDevelopment,
            sourceMaps: isDevelopment
        })).on('error', (notify.onError("Error compiling js"), console.error.bind(console)))
        .pipe(gulp.dest('assets/js/app'));

});



gulp.task('clean', function() {
    return del('assets/css', 'assets/js/app');
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'js', 'html')));

gulp.task('upload', function() {
    return gulp
        .src(['./**/*', '!**/node_modules/**', '!./vendor/**', '!./audio/**', '!./src/**', '!./dest/images/**', '!./uploads/**'])
        .pipe(gulpSSH.dest(`${siteRoot}`))
})


gulp.task('upload-html', function() {
    return gulp
        .src(['./assets/html/*.html'])
        .pipe(gulpSSH.dest(`${siteRoot}/assets/html`))
})

gulp.task('upload-index', function() {
    return gulp
        .src(['./index.html'])
        .pipe(gulpSSH.dest(`${siteRoot}`))
})



gulp.task('upload-style', function() {
    return gulp
        .src(['./assets/css/**/**.css'])
        .pipe(gulpSSH.dest(`${siteRoot}/assets/css`))
})

gulp.task('upload-data', function() {
    return gulp
        .src(['./data/**.json'])
        .pipe(gulpSSH.dest(`${siteRoot}/data/`))
})

gulp.task('upload-js', function() {
    return gulp
        .src(['./assets/js/app/**.js'])
        .pipe(gulpSSH.dest(`${siteRoot}/assets/js/app`))
})

gulp.task('upload-images', function() {
    return gulp
        .src(['./assets/images/**'])
        .pipe(gulpSSH.dest(`${siteRoot}/assets/images`))
})
gulp.task('upload-vendor', function() {
    return gulp
        .src(['./vendor/**'])
        .pipe(gulpSSH.dest(`${siteRoot}/vendors`))
})

gulp.task('deploy', gulp.series(
    'build', 'upload'));

gulp.task('watch', function() {
    gulp.watch('./src/**', gulp.series('styles', 'js', 'html', 'upload-style', 'upload-data', 'upload-js', 'upload-html'));

    //gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
});

gulp.task('dev', gulp.series('build', 'watch'));