

window.onload = function(){  //Local storage
  let store = document.getElementById("submit-button");
  store.onclick = function(){
    let artistsSearch = document.getElementById("search-box").value;
    let artists = artistsSearch.split(",");
    let x = 0;
    var e  = " ";
    while(e != null){
      e = localStorage.getItem('Artist' + x.toString());

      x++;
    }
    x--;
    for (var i = x; i < artists.length+x; i++) {
      localStorage.setItem("Artist"+ i.toString(),artists[i-x]);
    }
  }
  let clearButton = document.getElementById("clear");
  clearButton.onclick = function(){
    localStorage.clear();
  }
};
