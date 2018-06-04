

window.onload = function(){  //Local storage
  let store = document.getElementById("submit-button");
  store.onclick = function(){
    let artistsSearch = document.getElementById("search-box").value;
    let artists = artistsSearch.split(",");
    for (var i = 0; i < artists.length; i++) {
      console.log(artists[i]);
      localStorage.setItem("Artist"+ i.toString(),artists[i]);
    }
  }
  let clearButton = document.getElementById("clear");
  clearButton.onclick = function(){
    localStorage.clear();
  }
};
