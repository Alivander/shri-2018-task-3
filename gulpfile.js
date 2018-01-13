"use strict";

var gulp = require("gulp");
var server = require("browser-sync").create();
var plumber = require("gulp-plumber");

var htmlmin = require("gulp-htmlmin");

var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssmin = require("gulp-csso");

var jsmin = require("gulp-uglyfly");

var imagemin = require("gulp-imagemin");

var run = require("run-sequence");
var rename = require("gulp-rename");
var del = require("del");

gulp.task("html", function() {
  return gulp.src("*.html")
    .pipe(plumber())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("public"))
    .pipe(server.stream());
});

gulp.task("style", function () {
	return gulp.src("sass/style.scss")
    .pipe(plumber())
		.pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
		.pipe(gulp.dest("public/css"))
    .pipe(cssmin())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("public/css"))
    .pipe(server.stream());
});

gulp.task("script", function () {
	return gulp.src("js/**/*.js")
    .pipe(plumber())
    .pipe(jsmin())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("public/js"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("public/img"));
});

gulp.task("fonts", function () {
  return gulp.src("fonts/*.{woff,woff2}")
    .pipe(plumber())
    .pipe(gulp.dest("public/fonts"));
});

gulp.task("clean", function () {
  return del("public");
});

gulp.task("serve", function() {
  server.init({
    server: "public/"
  });

  gulp.watch("*.html", ["html"]);
  gulp.watch("sass/**/*.scss", ["style"]);
  gulp.watch("js/**/*.js", ["script"]);
  gulp.watch("img/**/*.{png,jpg,svg}", ["images"]);
});

gulp.task("build", function (done) {
  run(
      "clean",
      "html",
      "style",
      "script",
      "images",
      "fonts",
      done
  );
});
