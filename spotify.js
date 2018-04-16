SC.initialize({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'API_StreamingMusic.html'
});

SC.connect().then(function() {
  return SC.get('/me');
}).then(function(me) {
  alert('Hello, ' + me.username);
});

var index = 0;
var currentSongIndex = 0; //Index for current song
//Song data
var song = {
    title: [],
    artist: [],
    id: [],
    duration: []
};

//Get one of my playlists and store the data of each song
SC.get('playlists/8397828').then(function(playlist) { //Summer Playlist
    playlist.tracks.forEach(function (track) {
        song.id[index] = track.id;
        console.log(track.title);
        song.title[index] = track.title;
        song.artist[index] = track.user.username;
        song.duration[index] = track.duration;
        console.log(track.duration);
        index++;
    });

    playCurrentSong();

    function playCurrentSong() {
        console.log("got into playCurrentSong function");
        //Stream playlist, looping when end of playlist is reached
        SC.stream('/tracks/' + song.id[currentSongIndex]).then(function (player) {
            player.play();
        });
        console.log("duration " + song.duration[currentSongIndex]);
        setTimeout(queueNextSong, song.duration[currentSongIndex]);
    }

    function queueNextSong() {
        console.log("got into queueNextSong function");

        if (currentSongIndes < song.id.length) {
            console.log(currentSongIndex);
            //next index for next song id
            currentSong++;
        }
        else {
            currentSongIndex = 0;
            console.log(currentSongIndex)
        }
        playCurrentSong();
    }
});
