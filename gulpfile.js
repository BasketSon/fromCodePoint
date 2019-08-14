"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const server = require("browser-sync").create();
const rename = require("gulp-rename");
const posthtml = require("gulp-posthtml");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const jsmin = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");

gulp.task("clear", async function () {
  await del("dist/**");
});

gulp.task("html", function () {
  return gulp.src(["app/*.html"],
  {
    base: "app"
  })
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("dist"));
});

gulp.task("css", function () {
  return gulp.src(["app/css/**"],
  {
    base: "app"
  })
  .pipe(plumber())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(minify())
  .pipe(gulp.dest("dist"));
});


gulp.task("js", function () {
  return gulp.src(["app/js/**"],
   {
    base: "app"
  })
  .pipe(jsmin())
  .pipe(gulp.dest("dist"));
});


gulp.task("server", function () {
  server.init({
    server: "dist/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("app/*.html", gulp.series("html")).on("change", server.reload);
  gulp.watch("app/js/**/*.js", gulp.series("js")).on("change", server.reload);
  gulp.watch("app/css/**/*.css", gulp.series("css")).on("change", server.reload);
});

gulp.task("images", function () {
  return gulp.src("app/img/**/*.{jpg,png,svg}")
    .pipe(imagemin({verbose: true}))
    .pipe(gulp.dest("dist/img"));
});

gulp.task("copyrest", function () {
  return gulp.src(["app/**", "!app/css/**", "!app/img/**", "!app/js/**", "!app/*.html"],
  {
    base: "app"
  })
  .pipe(gulp.dest("dist"));
});

gulp.task("docs", function () {
  del("docs/**");
  return gulp.src("dist/**")
  .pipe(gulp.dest("docs"));
})
// gulp.task("webp", function () {
//   return gulp.src("build/img/**/*.{jpg,png}")
//     .pipe(webp({quality: 90}))
//     .pipe(gulp.dest("build/img"));
// });
//
// gulp.task("sprite", function () {
//   return gulp.src("build/img/icon-*.svg")
//     .pipe(svgstore({
//       inlineSvg: true
//     }))
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest("build/img"));
// });

gulp.task("start", gulp.series("html", "css", "js", "server"));
gulp.task("build", gulp.series("clear", "html", "js", "css", "images", "copyrest", "docs", "server"));
