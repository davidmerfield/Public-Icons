var fs = require('fs'),
    CleanCSS = require('clean-css'),
    UglifyJS = require("uglify-js"),
    cheerio = require('cheerio'),
    rmdir = require('rimraf');

var sourceDir = __dirname + '/source/',
    iconDir = __dirname + '/icons/',
    distDir = __dirname + '/public/';

var chokidar = require('chokidar'), 
    watcher = chokidar.watch(sourceDir, {ignored: /^\./, persistent: true});
    watcher.add(iconDir + '_metadata.json');
    watcher.on('change', function(path) {compile();});

compile();

function compile () {

  empty(distDir);

  moveImages('favicon.png', 'search.svg');
  compressCSS('style.css');
  compressJS('lib/lunr.js','lib/mustache.js', 'app.js');

  var metadata = JSON.parse(fs.readFileSync(iconDir + '_metadata.json', 'utf8'));
  
  createIconPages(metadata);
  createHomepage(metadata);

  makeStaticPages('license');

  console.log('Built site...');
}

function createIconPages (metadata) {
      
  fs.mkdirSync(distDir + '/icon');

  var iconCSS = '';

  for (var fileName in metadata) {

    var iconData = metadata[fileName],
        title = iconData.title,
        slug = makeSlug(title, fileName);

    fs.mkdirSync(distDir + '/icon/' + slug);

    var iconTemplate = fs.readFileSync(sourceDir + '/icon.html'),
        $icon = cheerio.load(iconTemplate);

    $icon('.iconContainer h1').text(title);
    $icon('.iconContainer a').attr('href', '/icon/'+slug+'/' + fileName);
    $icon('.icon').addClass('iconBG').addClass(slug);
    
    iconTemplate = $icon.html()

    var svg = fs.readFileSync(iconDir + fileName, 'utf8');
    var foo = svg.slice(svg.indexOf('<svg '));
    var basesixtyfoursvg = new Buffer(foo).toString('base64');
    var newline = ".icon." + slug + " {background-image: url('data:image/svg+xml;base64," + basesixtyfoursvg + "');}";

    iconCSS += newline;

    fs.writeFileSync(distDir + '/icon/' + slug + '/index.html', iconTemplate);

    fs.writeFileSync(distDir + '/icon/' + slug + '/' + fileName, fs.readFileSync(iconDir + fileName));

  }

  fs.writeFileSync(distDir + '/icons.css', iconCSS);


}

function makeStaticPages() {

  for (var i in arguments) {

    fileName = arguments[i];

    fs.mkdirSync(distDir + fileName);

    fs.writeFileSync(distDir + fileName + '/index.html', fs.readFileSync(sourceDir + fileName + '.html'));    
  }

}


function createHomepage(metadata) {

  var homepage = fs.readFileSync(sourceDir + '/index.html', 'utf8'),
      $ = cheerio.load(homepage),
      index = 0;

  for (var fileName in metadata) {

    var iconData = metadata[fileName],
        tags = iconData.tags.join(', '),
        title = iconData.title,
        slug = makeSlug(title, fileName);

    var newLink = '<a href="/icon/' + slug +'" class="icon '+slug+'" data-index="' + (++index) + '" data-tags="' + tags + '" title="' + title + '"></a>'
    
    $('#allIcons').append(newLink);
  }

  homepage = $.html();

  fs.writeFileSync(distDir + '/index.html',homepage);

}

function empty (dirPath, removeSelf) {

  if (removeSelf === undefined)
    removeSelf = false;

  try {
    var files = fs.readdirSync(dirPath);
  } catch(e) {
    return; 
  }
  
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        empty(filePath, true);
    }    
  }
  
  if (removeSelf)
    fs.rmdirSync(dirPath);
};

function makeSlug (string, fileName) {
  string = string.replace('/',' ').replace(/[\.,\/#\'!$%\^&\*;:{}=_`~()]/g,"").trim().replace(/ +/g,'-').toLowerCase();
  
  try {
    string = encodeURIComponent(string).split('%').join('-');
  } catch (err) {
    string = makeFromFile(fileName);
  }
  // ensure slug is less than 1k chars long
  return string.slice(0, 1000);
}

function moveImages () {

  for (var i in arguments) {

    fileName = arguments[i];

    fs.writeFileSync(distDir + fileName, fs.readFileSync(sourceDir + fileName));    
  }
}

function compressJS () {

  var js = '', fileName, uncompressedFile;

  for (var i in arguments) {

    fileName = arguments[i];

    uncompressedFile = fs.readFileSync(sourceDir + fileName, 'utf8');

    js += uncompressedFile;
  }

  fs.writeFileSync(distDir + fileName, js);

  // this shit below will uglify the files

  // var files =[];

  // for (var i in arguments)
  //   files.push(sourceDir + arguments[i]);

  // fs.writeFileSync(distDir + 'app.js', UglifyJS.minify(files).code);
}

function compressCSS () {

  var css = '', fileName, uncompressedCSS;

  for (var i in arguments) {

    fileName = arguments[i];

    uncompressedCSS = fs.readFileSync(sourceDir + fileName, 'utf8');

    css += new CleanCSS().minify(uncompressedCSS);
  }

  fs.writeFileSync(distDir + fileName, css);

  return
}