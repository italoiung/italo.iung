const { src, dest, watch, parallel, series } = require('gulp')
const del = require('del')
const fs = require('fs')
const browsersync = require('browser-sync').create()
const pug = require('gulp-pug')
// const { appendText, prependText } = require('gulp-append-prepend')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const webp = require('imagemin-webp')
const extReplace = require('gulp-ext-replace')
const responsive = require('gulp-responsive')
const uglify = require('gulp-uglify-es').default
const replace = require('gulp-replace')

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: './dist'
        },
        port: 3000
    })
    done()
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload()
    done()
}

// Clean assets
function clean() {
    return del(['./dist/assets/', './dist/index.html', './src/compiled', './src/img/projects/sizes']);
}

// Paths config
const paths = {
    'scss': {
        'origin': './src/scss/**/*.scss',
        'dest': './src/compiled/css'
    },
    'js': {
        'origin': './src/js/**/*.js',
        'dest': './src/compiled/js'
    },
    'img': {
        'origin': './src/img/**/*.*',
        'dest': './dist/assets/img'
    },
    'img_projects': {
        'origin': './src/img/projects/*.*',
        'dest': './src/img/projects/sizes'
    },
    'vid': {
        'origin': './src/vid/**/*.*',
        'dest': './dist/assets/vid'
    },
    'meta': {
        'origin': './src/meta/**/*.*',
        'dest': './dist/assets/meta'
    },
    'font': {
        'origin': './src/font/**/*.woff',
        'dest': './dist/assets/font'
    },
    'components': {
        'origin': './src/components/*.pug',
        'watch': './src/components/**/*.pug',
        'dest': './dist'
    },
}

// Image resize
function img_resize() {
    return src(paths.img_projects.origin)
        .pipe(responsive(
            {
                '*.jpg': [
                    {
                        width: 576,
                        rename: function (path) {
                            return {
                                dirname: path.dirname,
                                basename: path.basename + '-sm',
                                extname: '.jpg'
                            }
                        }
                    },
                    {
                        width: 768,
                        rename: function (path) {
                            return {
                                dirname: path.dirname,
                                basename: path.basename + '-md',
                                extname: '.jpg'
                            }
                        }
                    },
                    {
                        width: 1200,
                        rename: function (path) {
                            return {
                                dirname: path.dirname,
                                basename: path.basename + '-lg',
                                extname: '.jpg'
                            }
                        }
                    }
                ],
                '*.png':
                {
                    width: 300,
                    rename: function (path) {
                        return {
                            dirname: path.dirname,
                            basename: path.basename + '-sm',
                            extname: '.png'
                        }
                    }
                }
            },
            {
                errorOnEnlargement: false
            }
        ))
        .pipe(dest(paths.img_projects.dest))
}

// Images optmization
function img() {
    return src(paths.img.origin)
        .pipe(newer(paths.img.dest))
        .pipe(imagemin([
            imagemin.gifsicle(),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng(),
            imagemin.svgo({
                plugins: [
                    { removeHiddenElems: false },
                    { removeUnusedNS: false },
                    { removeUselessDefs: false },
                    { collapseGroups: false },
                    { cleanupIDs: false },
                    { removeEmptyContainers: false }
                ]
            })
        ]))
        .pipe(dest(paths.img.dest))
        .pipe(imagemin([webp()]))
        .pipe(extReplace('.webp'))
        .pipe(dest(paths.img.dest))
}

// Conpile pug pages to html
var cbString = new Date().getTime();
function components() {
    return src(paths.components.origin)
        .pipe(pug({
            locals: {
                github: fs.readFileSync('./dist/assets/img/icons/github.svg', 'utf8'),
                linkedin: fs.readFileSync('./dist/assets/img/icons/linkedin.svg', 'utf8'),
                whatsapp: fs.readFileSync('./dist/assets/img/icons/whatsapp.svg', 'utf8'),
                link: fs.readFileSync('./dist/assets/img/icons/link.svg', 'utf8'),
                eye: fs.readFileSync('./dist/assets/img/icons/eye.svg', 'utf8'),
                gatsby: fs.readFileSync('./dist/assets/img/icons/gatsby.svg', 'utf8'),
                wordpress: fs.readFileSync('./dist/assets/img/icons/wordpress.svg', 'utf8'),
                girl: fs.readFileSync('./dist/assets/img/contact_colored.svg', 'utf8'),
                year: new Date().getFullYear()
            }
        }))
        .pipe(replace(/cb=\d+/, 'cb=' + cbString))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(paths.components.dest))
        .pipe(browsersync.stream())
}

// Conpile scss files
function scss() {
    return src(paths.scss.origin)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.scss.dest))
        .pipe(browsersync.stream())
}

// Concatenate and minify js files
function js() {
    return src(paths.js.origin)
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.js.dest))
        .pipe(browsersync.stream())
}

// Just move video files to build
function vid() {
    return src(paths.vid.origin)
        .pipe(newer(paths.vid.dest))
        .pipe(dest(paths.vid.dest))
}

// Just move meta files to build
function meta() {
    return src(paths.meta.origin)
        .pipe(newer(paths.meta.dest))
        .pipe(dest(paths.meta.dest))
}

// Just move font files to build
function font() {
    return src(paths.font.origin)
        .pipe(newer(paths.font.dest))
        .pipe(dest(paths.font.dest))
}

// Watch for changes
function watchFiles() {
    watch(paths.scss.origin, series(scss, components, browserSyncReload))
    watch(paths.js.origin, series(js, components, browserSyncReload))
    watch(paths.components.watch, series(components, browserSyncReload))
    watch(paths.img_projects.origin, series(img_resize, img))
    watch(paths.img.origin, img)
    watch(paths.vid.origin, vid)
    watch(paths.meta.origin, meta)
    watch(paths.font.origin, font)
}

const build = series(clean, parallel(series(parallel(series(img_resize, img), scss, js), components), vid, meta, font))
const watcher = parallel(watchFiles, browserSync)

exports.img = img
exports.scss = scss
exports.js = js
exports.components = components
exports.clean = clean
exports.build = build
exports.watcher = watcher
exports.default = build
