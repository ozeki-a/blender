const gulp = require("gulp");

// scss/pug
const sass = require("gulp-sass");
const pug = require("gulp-pug");

// js
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

//環境
const browserSync = require("browser-sync");
const plumber = require("gulp-plumber");
const connectSSI = require('connect-ssi');

// useful
const data = require("gulp-data");
const jsonfile = require("jsonfile");
const rename = require("gulp-rename");
const beautify = require('gulp-beautify');

var PATH = "blender";

gulp.task("server", () => {
  browserSync({
    port: 8000,
    startPath: "./" + PATH,
    server: {
      baseDir: "./public",
      middleware: [
        connectSSI({
          ext: '.html',
          baseDir: __dirname + '/public'
        })
      ]
    }
  });
});

gulp.task("sass", () => {
  console.log("*** sass コンパイル ***")
  return gulp.src(["src/scss/**/*.scss", "!./src/scss/**/_*.scss"])
    .pipe(plumber())
    .pipe(sass())
    // .pipe(autoprefixer())
    .pipe(gulp.dest("./public/" + PATH +"/assets/css"))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task("pug", () => {
  console.log("*** pug コンパイル ***")
  return gulp.src(["src/pug/**/*.pug", "!./src/pug/**/_*.pug", "!src/pug/inc/**/*.pug"])
    .pipe(data(function(file) {
      dir = 'site.json';
      return json = jsonfile.readFileSync(dir);
    }))
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(gulp.dest("./public/" + PATH))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())  // ソースマップを初期化
    .pipe(uglify())          // JSを整形
    .pipe(sourcemaps.write()) // ソースマップの作成
    .pipe(gulp.dest("./public/" + PATH + "/assets/"));
});

// pugタスク実行
gulp.task("inc", () => {
  console.log(" ***** incコンパイル ***** ");

  return gulp.src(["src/pug/inc/**/*.pug"])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    })) // pug実行（pretty:整形）※コンパイル
    .pipe(rename({
      extname: '.shtml'
    }))
    .pipe(gulp.dest("public/" + PATH +"/assets/inc/"))
  ;
});

gulp.task("watch", () => {
  gulp.watch(["src/js/**/*.js"], gulp.task('js'));
  gulp.watch(["src/pug/**/*.pug"], gulp.task('pug'));
  gulp.watch(["src/pug/inc/*.pug"], gulp.task('inc'));
  gulp.watch(["src/scss/**/*.scss"], gulp.task('sass'));
});
gulp.task('default', gulp.parallel('server', 'watch'));
