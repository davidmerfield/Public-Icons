var fs = require('fs');
var clean = require('clean-css');
var uglify = require("uglify-js");
var cheerio = require('cheerio');
var empty = require('rimraf').sync;
var render = require('mustache').render;
var dirname = require('path').dirname;

compile();

// watch icon directory for any changes
// and rebuild when we spot one.
fs.watch('source', compile);

function compile () {

  // Make the output dir if it doesn't exist
  try {fs.mkdirSync('public');} catch (e) {}

  // Ensure the output dir is empty
  empty('public/*');

  var icons = extract('icons.json');
  var partials = {
    header: read('header.html'),
    head: read('head.html'),
    footer: read('footer.html')
  };

  // Build the homepage & icon pages
  homepage(icons, partials, 'index.html');
  permalinks(icons, partials, 'icon.html');

  copy('favicon.png');
  copy('bull.jpg');

  static(['about', 'license'], partials);

  compressCSS('style.css');
  compressJS('lib/lunr.js','app.js');

  console.log('Built site...');
}

function output (name, contents) {

  if (name && name.indexOf('/') > -1) {
    var parent = dirname(name);
    try {fs.mkdirSync('public/' + parent);} catch (e) {}
  }

  fs.writeFileSync('public/'+name, contents, 'utf8');
}

function read (name) {
  return fs.readFileSync('source/'+ name, 'utf8');
}

function copy (from, to) {

  // make parent folder exist
  if (to && to.indexOf('/') > -1) {
    var parent = dirname(to);
    try {fs.mkdirSync('public/' + parent);} catch (e) {}
  }

  // make parent folder exist
  fs.writeFileSync('public/'+ (to || from), fs.readFileSync('source/' + from));
}

function homepage (icons, partials, name) {
  output(name, render(read(name), {icons: icons}, partials));
}

function static (pages, partials) {

  for (var i in pages)
    output(pages[i] + '/index.html', render(read(pages[i]+'.html'), {}, partials));

}

function extract (metadata) {

  metadata = JSON.parse(read(metadata));

  var icons = [];

  for (var name in metadata) {

    if (name.indexOf('.svg') === -1) continue;

    var svg = read('icons/' + name);
    var tags = metadata[name].join(', ');
    var svgEl = el(svg, slug(name));
    var base64 = new Buffer(svgEl).toString('base64');

    var icon = {
      svg: svg,
      tags: tags,
      name: name,
      slug: slug(name),
      title: title(name),
      index: icons.length,
      svgEl: svgEl,
      base64: base64
    };

    icons.push(icon);
  }

  return icons;
}

function title (str) {
  str = str.slice(0, str.lastIndexOf('.svg'));
  str = str[0].toUpperCase() + str.slice(1);
  str = str.split('_').join(' ');
  return str;
}

function slug (str) {
  return str.slice(0, str.lastIndexOf('.svg')).trim().toLowerCase().split('_').join('-');
}

function el (svg, slug) {

  var $ = cheerio.load(svg, {xmlMode: true});

  $('svg')
    .removeAttr('version')
    .removeAttr('width')
    .removeAttr('height')
    .removeAttr('enable-background')
    .attr('id', 'icon-' + slug);

  // this gets the outerhtml of the svg el
  return $.xml($('svg'));
}

function permalinks (icons, partials, name) {

  var template = read(name);

  for (var i in icons) {

    var icon = icons[i];
    var slug = icon.slug;
    var pagePath = slug + '-icon/';

    fs.mkdirSync('public/' + pagePath);

    var path = pagePath + 'index.html';

    output(path, render(template, icon, partials));
    output(pagePath + icon.name, icon.svg);
  }
}

function compressJS () {

  var js = '';

  // concatenate passed files
  for (var i in arguments)
    js += read(arguments[i]);

  // write concatenated file
  output('app.js', js);

  // then minify it since we can't pass a string to uglify
  output('app.js', uglify.minify('public/app.js').code);
}

function compressCSS () {

  var css = '';

  for (var i in arguments)
    css += new clean().minify(read(arguments[i]));

  output('style.css', css);
}

module.exports = compile;