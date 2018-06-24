//install node.js (npm), browserify, then
// TAKE A LOOK AT: https://github.com/jmperez/spotify-web-api-js

const app = {};

let artistsLength = 0;
let artistsArray = [];
let oauthToken = 'BQACw3p_Ay0bqefPfdVwo7pNVXsMG2gboSTaHWvqcFLz_WVW7qglEMWNEBeyRtYE7U51mpHhhycTrHOaHreALRh1nDImaF66TWwnn3zu5J3WW9cYixo0RGuUSi5Wcw9Uzajym3IK4fuQh42yaAtKmtk5GhSiwZZN3qwH6VeVUN0wiAen7eZ5qgDUXxwczIY6TZ3dVhV-a-YasoJX24uOWViCWN6s_U7yG_OmvIRlDx9rBrc2eQTEF9RQdX6CMVfis0a2J43_eIauK-7h3YX19mWXYfQ';
let devices = [];
let names = [];
let currentPlaylist = null;
let currentPlaylistUri = null;
let finished = false;
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

app.getAlbums = function (artists) {
    console.log(artists)
    let albums = artists.map(artist => app.getAristsAlbums(artist['id']));
    $.when(...albums)
        .then((...albums) => {
            let albumIds = albums
                .map(a => a[0].items) //get the first element of the array
                .reduce((prev, curr) => [...prev, ...curr], [])
                .map(album => app.getAlbumSongs(album.id));

            app.getTracks(albumIds);
        });
};

app.getTracks = function (tracks) {
    $.when(...tracks)
        .then((...tracks) => {
            tracks = tracks
                .map(getDataObject)
                .reduce((prev, curr) => [...prev, ...curr], []);
            console.log(tracks);
            playlist = app.createPlayList('diesiebenzwerge-at');
            playlistID = '';
            $.when(playlist).then((playlist) => {
                playlistID = playlist['id'];
                currentPlaylistUri = playlist['uri'];
                console.log(playlistID);
                tracks = getRandomTracks(parseInt(document.getElementById('tracks').value), tracks);
                console.log(tracks);
                songs = tracks.map(song => song.uri).join(',');
                app.addTrackToPlaylist('diesiebenzwerge-at', playlistID, songs);
            }).then(() => {
                baseUrl = 'https://open.spotify.com/embed/user/' + 'diesiebenzwerge-at' + '/playlist/' + playlistID;
                $('.playlist').append(`<iframe src="${baseUrl}" height="400"></iframe>`);
                $('.loader').removeClass('show');
            });
        });
};


app.createPlayList = (user) => $.ajax({
    url: 'https://api.spotify.com/v1/users/' + user + '/playlists',
    method: 'POST',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json',
    contentType: "text/plain;charset=UTF-8",
    data: JSON.stringify({
        name: currentPlaylist,
        description: "Created by me",
        public: false
    })
});

app.addTrackToPlaylist = (user, playlist, tracks) => $.ajax({
    url: 'https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist + '/tracks?position=0&uris=' + tracks,
    method: 'POST',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json',
    contentType: "text/plain;charset=UTF-8"
});
app.getUserAvailableDevices = () => $.ajax({
    url: 'https://api.spotify.com/v1/me/player/devices',
    method: 'GET',
    headers: {"authorization": 'Bearer ' + oauthToken},
    dataType: 'json',
    success: function (value) {
        console.log(value);
        for (let i = 0; i < value['devices'].length; i++) {
            devices.push(value['devices'][i]['id']);
            names.push(value['devices'][i]['name']);
        }
        for (let i = 0; i < devices.length; i++) {
            $('#devices').append($('<option>', {
                value: i,
                text: names[i]
            }));
        }
        if(devices.length === 0){
          var elem = document.getElementById('playDevice');
          elem.parentNode.removeChild(elem);
          let elm2 = document.getElementById('devices');
          elm2.parentNode.removeChild(elm2);
        }
    }
});

function playD() {
    let number = $("select#devices").val();
    let m = $.ajax({
        url: 'https://api.spotify.com/v1/me/player',
        method: 'PUT',
        headers: {"authorization": 'Bearer ' + oauthToken},
        dataType: 'json',
        contentType: "text/plain;charset=UTF-8",
        data: JSON.stringify(
            {
                "device_ids": [
                    devices[number]
                ]
            }
        )
    });

    $.when(m).then(()=>$.ajax({
        url: 'https://api.spotify.com/v1/me/player/play?device_id=' + devices[number],
        method: 'PUT',
        headers: {"authorization": 'Bearer ' + oauthToken},
        dataType: 'json',
        contentType: "text/plain;charset=UTF-8",
        data: JSON.stringify({
            "context_uri": currentPlaylistUri,
            "offset": {
                "position": 0
            }
        })
    }));
}

/*function login(){
    app.login().then((url) => {
        window.location.href = url;
    });
}*/

app.init = function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        let artists = document.getElementById('search').value;
        try{
            let iframe = document.getElementsByTagName("iframe")[0];
            iframe.parentNode.removeChild(iframe);
        }
        catch (e) {

        }
        $('.loader').addClass('show');
        currentPlaylist = artists.split(',').join(' & ');
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
    dev = app.getUserAvailableDevices();
};

/*app.login = function(callback) {
	_clientId = '1f22e4c0ce5c488f80175f6b8a869654';
    _redirect_uri = 'https://localhost:4443/test.html';
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
}*/

const getDataObject = arr => arr[0].items;

function getRandomTracks(num, tracks) { //generate Playlist with random songs from the artists
    const randomResults = [];
    if(isNaN(num)){
        num = 20;

    }
    for (let i = 0; i < num; i++) {
        randomResults.push(tracks[Math.floor(Math.random() * tracks.length)])
    }
    return randomResults;
}

$(app.init);
