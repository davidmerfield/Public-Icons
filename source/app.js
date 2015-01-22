var index = lunr(function () {
    this.field('title', {boost: 10})
    this.field('tags')
    this.ref('id')
  });

var iconList = {};

var iconNodes = document.querySelectorAll('#allIcons a');

console.log(iconNodes);

for (var i in iconNodes) {

  var node = iconNodes[i];
  
  if (!node.getAttribute) continue;
  
  var nodeInfo ={
    id: parseInt(node.getAttribute('data-index')),
    title: node.getAttribute('title'),
    tags: node.getAttribute('data-tags')
  };

  console.log(nodeInfo);
  iconList[nodeInfo.id] = node;

  index.add(nodeInfo);
}

var search = document.getElementById('search'),
    searchResults = document.getElementById('searchResults');

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