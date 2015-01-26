var index = lunr(function () {
    this.field('title', {boost: 10})
    this.field('tags')
    this.ref('id')
  });

var iconList = {};

var iconNodes = document.querySelectorAll('#allIcons a');

for (var i in iconNodes) {

  var node = iconNodes[i];
  
  if (!node.getAttribute) continue;
  
  var nodeInfo ={
    id: parseInt(node.getAttribute('data-index')),
    title: node.getAttribute('title'),
    tags: node.getAttribute('data-tags').split(', ')
  };

  iconList[nodeInfo.id] = node;

  index.add(nodeInfo);
}

var search = document.getElementById('search'),
    searchResults = document.getElementById('searchResults');

if (search) {
  search.focus();

  search.onkeyup = function() {

    var results = index.search(search.value);

    searchResults.innerHTML ='';

    if (results.length) {
      searchResults.style.display ='block';
      allIcons.style.display = 'none';
    } else {
      searchResults.style.display ='none';
      allIcons.style.display = 'block';
    }

    for (var i in results) {

      var id = results[i].ref;
      
      searchResults.appendChild(iconList[id].cloneNode(true));
    }

  }  
}


if (window.location.host.indexOf('localhost') < 0) {
  
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-8666188-12', 'auto');
  ga('send', 'pageview');
}