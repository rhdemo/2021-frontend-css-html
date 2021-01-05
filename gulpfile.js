const { watch, series, src, dest } = require("gulp");
const bs = require("browser-sync").create();
const compress = require("compression");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");

sass.compiler = require("node-sass");

function sassCompile() {
  return src("./scss/styles.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest("./css"));
}

function browserSync(cb) {
  bs.init({
    server: {
      baseDir: "./",
      middleware: [compress()]
    }
  });

  cb();
}

function browserSyncReload(cb) {
  bs.reload();
  cb();
}

function watchTask() {
  watch("*.html", browserSyncReload);
  watch("./scss/**/*.scss", series(sassCompile, browserSyncReload));
}

const defaultTask = series(
  sassCompile,
  browserSync,
  watchTask
);

exports.default = defaultTask;
