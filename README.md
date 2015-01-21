# Public Icons

A collection of icons in the public domain. See all the icons at [the project's website](http://publicicons.org).

### License

This project, including the website, are released into the public domain.

### How to contribute

There will always be new icons to draw and existing icons to improve. Feel free to suggest improvements. Broadly speaking the projects icons are designed to be paired with heavy sans-serif typeface. Ideally they should be meaningful when shrunk down to small sizes. 

1. Apple
2. Pear
3. Orange
4. Pineapple

### Submitting an icon

Ideally submit a pull request through Github. All you need to do is add the icon in svg format to /icons and append the icon's metadata (title, description, tags) to icons/_metadata.js. 

Otherwise you can email the icon to me at [dmerfield@gmail.com](mailto:dmerfield@gmail.com).

### Building the site locally

```Build.js``` is a node script which takes all the icons declared in ```icons/_metadata.json``` then populates the templates in /source then produces the site in /public

To set up the site locally run ```npm install``` then ```node build.js```. The script will populate the folder ```public``` with the finished site.

