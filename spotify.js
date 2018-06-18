//install node.js (npm), browserify, then
// TAKE A LOOK AT: https://github.com/jmperez/spotify-web-api-js

const app = {};

let artistsLength = 0;
let artistsArray =[];

window.onload = function(){  //Local storage
  let store = document.getElementById("submit-button");
  store.onclick = function(){
    let artistsSearch = document.getElementById("search-box").value;
    let artists = artistsSearch.split(",");
    let i;
    for ( i = artistsLength; i < artists.length+artistsLength; i++) {
      localStorage.setItem("Artist"+ i.toString(),artists[i-artistsLength]);
    }
    artistsLength = i;

  }
  let clearButton = document.getElementById("clear");
  clearButton.onclick = function(){
    localStorage.clear();
    artistsLength = 0;
  }
};


app.getArists = (artist) => $.ajax({ //Search for the entered artists
	url: 'https://api.spotify.com/v1/search/',
	method: 'GET',
	dataType: 'json',
    headers: {'Authorization': 'Bearer BQAMG36lU1e9GAtdi_Cm4oBIP5NFmogBM1xUcbPl4yuPJ60PqHnNkikJLKVLJRJhzOTrpXq0ugha9skHuog1rQazC8ghGXRszZ7JffrTMZLBNJBdh_9mjfs4liYe2Cn52FnZss6n'},
	data: {
		type: 'artist',
		q: artist,
        limit: 1
	}
});

app.getAristsAlbums = (id) => $.ajax({ // Get the artists' albums
	url: `https://api.spotify.com/v1/artists/${id}/albums`,
	method: 'GET',
    headers: {"authorization": "Bearer BQAMG36lU1e9GAtdi_Cm4oBIP5NFmogBM1xUcbPl4yuPJ60PqHnNkikJLKVLJRJhzOTrpXq0ugha9skHuog1rQazC8ghGXRszZ7JffrTMZLBNJBdh_9mjfs4liYe2Cn52FnZss6n"},
    dataType: 'json',
	data: {
		album_type: 'album',
	}
});

app.getAlbumSongs = (id) => $.ajax({ //get songs from albums
	url: `https://api.spotify.com/v1/albums/${id}/tracks`,
	method: 'GET',
    headers: {"authorization": "Bearer BQAMG36lU1e9GAtdi_Cm4oBIP5NFmogBM1xUcbPl4yuPJ60PqHnNkikJLKVLJRJhzOTrpXq0ugha9skHuog1rQazC8ghGXRszZ7JffrTMZLBNJBdh_9mjfs4liYe2Cn52FnZss6n"},
    dataType: 'json'
});

app.getAlbums = function(artists) {
	let albums = artists.map(artist => app.getAristsAlbums(artist.id));
	$.when(...albums)
		.then((...albums) => {
			let albumIds = albums
				.map(a => a[0].items) //get the first element of the array
				.reduce((prev,curr) => [...prev,...curr] ,[])
				.map(album => app.getAlbumSongs(album.id));

			app.getTracks(albumIds);
		});
};

app.getTracks = function(tracks) {
	$.when(...tracks)
		.then((...tracks) => {
			tracks = tracks
				.map(getDataObject)
				.reduce((prev,curr) => [...prev,...curr],[]);
			const randomPlayList = getRandomTracks(50,tracks);
			app.createPlayList(randomPlayList);
		})
};

app.createPlayList = function(songs) {
	const baseUrl = 'https://embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:';
	songs = songs.map(song => song.id).join(',');
	$('.loader').removeClass('show');
	$('.playlist').append(`<iframe src="${baseUrl + songs}" height="400"></iframe>`);
};

app.init = function() {
	$('form').on('submit', function(e) {
		e.preventDefault();
		let artists = $('input[type=search]').val();
		$('.loader').addClass('show');
		artists = artists
			.split(',')
			.map(app.getArists);

		$.when(...artists)
			.then((...artists) => {
				artists = artists.map(a => a[0].artists.items[0]);
				console.log(artists);
				app.getAlbums(artists);
			});
	});

};

const getDataObject = arr => arr[0].items;

function getRandomTracks(num, tracks) { //generate Playlist with random songs from the artists
	const randomResults = [];
	for(let i = 0; i < num; i++) {
		randomResults.push(tracks[ Math.floor(Math.random() * tracks.length) ])
	}
	return randomResults;
}

$(app.init);
