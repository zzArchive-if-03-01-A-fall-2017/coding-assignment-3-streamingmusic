//install node.js (npm), browserify, then
// TAKE A LOOK AT: https://github.com/jmperez/spotify-web-api-js

const app = {};

let artistsLength = 0;
let artistsArray =[];
let oauthToken = 'BQCdZk_Lbz_6y2fT-lvDsQqHVkN0fKwDZ9iG0-BRXpAE5mgcIWAuyGnJEqW2UOHmfpljcXTOUsR0YOmDxNlOxvJERXxGey958VEdEDqAWMWyvS_iApqN1fZRmShKU1oWE5WzjkBbMnKNSKdtkLa12rWRIsTvvRNbb-hRYWeSvzw24iw1oHgfco_ZJzgz65xvYQOYXxedV_9n0OSIde1DtCQKf6UY0XYe0RZ3he2J7Jk3Vg';
let devices = [];
let names = []
/*window.onload = function(){  //Local storage
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
};*/


app.getArists = (artist) => $.ajax({ //Search for the entered artists
	url: 'https://api.spotify.com/v1/search/',
	method: 'GET',
	dataType: 'json',
    headers: {'Authorization': 'Bearer ' + oauthToken},
	data: {
		type: 'artist',
		q: artist,
        limit: 1
	}
});

app.getAristsAlbums = (id) => $.ajax({ // Get the artists' albums
	url: 'https://api.spotify.com/v1/artists/' + id + '/albums',
	method: 'GET',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json',
	data: {
		album_type: 'album',
	}
});

app.getAlbumSongs = (id) => $.ajax({ //get songs from albums
	url: `https://api.spotify.com/v1/albums/${id}/tracks`,
	method: 'GET',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json'
});

app.getAlbums = function(artists) {
	console.log(artists)
	let albums = artists.map(artist => app.getAristsAlbums(artist['id']));
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
			console.log(tracks);
			const randomPlayList = getRandomTracks(50,tracks);
			playlist = app.createPlayList('diesiebenzwerge-AT');
            playlistID  = '';
			$.when(playlist).then((playlist) => {
				playlistID = playlist['id'];
				console.log(playlistID);
				tracks = getRandomTracks(15, tracks);
				console.log(tracks);
                songs = tracks.map(song => song.uri).join(',');
				app.addTrackToPlaylist('diesiebenzwerge-AT', playlistID, songs);
			}).then(() => {
				baseUrl = 'https://open.spotify.com/embed/user/' + 'diesiebenzwerge-at' + '/playlist/' + playlistID;
                $('.loader').removeClass('show');
                $('.playlist').append(`<iframe src="${baseUrl}" height="400"></iframe>`);
			});
		});
};



app.createPlayList = (user) => $.ajax({
        url: 'https://api.spotify.com/v1/users/' + user + '/playlists',
        method: 'POST',
        headers: {"authorization": 'Bearer ' + oauthToken},
        dataType: 'json',
    	contentType: "text/plain;charset=UTF-8",
        data:JSON.stringify({
        	name: "New Playlist",
            description: "Created by me",
            public: false
        })
});

app.addTrackToPlaylist = (user, playlist, tracks) => $.ajax({
    url: '	https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist + '/tracks?position=0&uris=' + tracks,
    method: 'POST',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json',
    contentType: "text/plain;charset=UTF-8",
    data:JSON.stringify({
        name: "New Playlist",
        description: "Created by me",
        public: false
    })
});
app.getUserAvailableDevices = () => $.ajax({
        url: 'https://api.spotify.com/v1/me/player/devices',
        method: 'GET',
        headers: {"authorization": 'Bearer ' + oauthToken},
        dataType: 'json',
		success: function (value) {
			for(let i = 0; i < value['devices'].length;i++){
				devices.push(value['devices'][i]['id']);
				names.push(value['devices'][i]['name']);
            }
        }
});

function login(){
    app.login().then((url) => {
        window.location.href = url;
    });
}

app.init = function() {
	$('form').on('submit', function(e) {
		e.preventDefault();
		let artists = document.getElementById('search').value;
		$('.loader').addClass('show');

		artists = artists
			.split(',')
			.map(app.getArists);
		$.when(...artists)
			.then((...artists) => {
				artists = artists.map(a => a[0]['artists']['items'][0]);
				console.log(artists);
				app.getAlbums(artists);
			});
	});
	app.getUserAvailableDevices();
};

app.login = function(callback) {
	_clientId = '1f22e4c0ce5c488f80175f6b8a869654';
    _redirect_uri = 'localhost:8000';
    _scopes = '';
    let url_login = 'https://accounts.spotify.com/en/authorize?response_type=token&client_id=' +
        _clientId + '&redirect_uri=' + encodeURIComponent(_redirect_uri) +
        ( _scopes ? '&scope=' + encodeURIComponent(_scopes) : '');
    if (callback) {
        return callback(url_login);
    } else {
        return new Promise((resolve) => {
            resolve(url_login);
        });
    }
}

const getDataObject = arr => arr[0].items;

function getRandomTracks(num, tracks) { //generate Playlist with random songs from the artists
	const randomResults = [];
	for(let i = 0; i < num; i++) {
		randomResults.push(tracks[ Math.floor(Math.random() * tracks.length) ])
	}
	return randomResults;
}

$(app.init);
