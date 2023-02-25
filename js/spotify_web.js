
//Replace with your own Spotify API client ID and client secret
let client_id= 'c69fdbfb0e20482b85142fb997c14208';
let client_secret = '05a7149bd02f428ea83927bfa0104181';
let week = 7;
let year = 2023;
let categories = ['Intro(Storstäder)', 'Splash', 'Singles Night', 'Greedy', 'Elements', 'Roadtrip'];
let songs_per_category = [6,8,6,6,6,8];
//let num_songs = sum(songs_per_category);

//Kategori https://open.spotify.com/playlist/68alwoOYLRoobdjq4eesrC?si=e200fd801e5a4307
let playlist_url_v7 = 'https://open.spotify.com/playlist/3HzbmfKUAjuOZUMA6P4F6q?si=91c7536e081f4f31';
let playlist_url_v3 = 'https://open.spotify.com/playlist/0fAuoyKg2VVHl5rY8vexui?si=449e395dade94d2d';


let d = new Date();
//alert("Today's date is " + d);
//document.body.innerHTML = "<h1>Today's date is " + d + "</h1>";


//Authenticate with Spotify API and get access token
function full_request(client_id, client_secret, playlist_url) {

    // STEP 1. Authentication (get access token)

    // Create a new http request 
    const Http = new XMLHttpRequest();

    // Specify the type of response we want back
    Http.responseType = 'json';

    // Assign url and assert the specified method
    const url='https://accounts.spotify.com/api/token';
    Http.open("POST", url, true);

    //Send the proper header information along with the request
    Http.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');

    // Define the function that gets called when the state changes
    Http.onreadystatechange = () => { // Call a function when the state changes.
        if (Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {

            // Print the access token
            //alert(Http.response['access_token']);
            //document.body.innerHTML = "<h1>Success1</h1>";

            // Go to STEP 2
            return get_playlist_data(playlist_url, Http.response['access_token']);
        }
    }

    // Initiate the request with the correct parameters
    let params ='grant_type=client_credentials&client_id='.concat(client_id,'&client_secret=',client_secret);
    Http.send(params);
}


function get_playlist_data(playlist_url, access_token) {

    // STEP 2. Get data from the API

    // Create a new http request 
    const Http = new XMLHttpRequest();

    // Specify the type of response we want back
    Http.responseType = 'json';
  
    // Extract the playlist id from the playlist_url
    playlist_id = playlist_url.split('/').pop();

    // Assign url and assert the specified method
    const url = 'https://api.spotify.com/v1/playlists/'.concat(playlist_id,'/tracks');
    Http.open("GET", url, true);
    
    //Send the proper header information along with the request
    Http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    Http.setRequestHeader('Authorization', 'Bearer '.concat(access_token));

    // Define the function that gets called when the state changes
    Http.onreadystatechange = () => { // Call a function when the state changes.
        if (Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {

            // Print the response 
            //alert(Http.response['tracks']['items']);
            //document.body.innerHTML = "<h1>Success2</h1>";

            // Go to STEP 3 
            return parse_playlist_data(Http.response);
        }
    }

    //Initiate the request
    Http.send();
}

function parse_playlist_data(playlist_data) {

    var par = document.getElementById("p");
    var text = document.createTextNode("This just got added");

    //par.appendChild(text);
 
    let category = 0;
    let song = 0;
    par.innerHTML += '<br>Facit MQ v.' + week + ' (' + year + ')<br><br>';
    par.innerHTML += 'Kategori ' +  (category+1) + ': ' + (categories[category]) + ': ' + (songs_per_category[category]*2) + 'p';

    //Print each track's name and artist
    let i = 0;
    //console.log(playlist_data['tracks']['items'])
    //console.log(playlist_data['tracks']['items'][i]['track']['artists'][0]['name'])
    for (const i in playlist_data['tracks']['items']) {
        
        let track_name = playlist_data['tracks']['items'][i]['track']['name'];
        console.log(track_name);
        let track_artists = '';
        let num_artists = playlist_data['tracks']['items'][i]['track']['artists']['length'];
        for (const artist in playlist_data['tracks']['items'][i]['track']['artists']) {
            //console.log(artist)
            track_artists += playlist_data['tracks']['items'][i]['track']['artists'][artist]['name'];
            if (artist < num_artists-1) {
                track_artists += ', '
            }
        }
        console.log(track_artists);
        par.innerHTML += '<br>' + (song+1) +'. ' + track_name + ' - ' + track_artists;

        song += 1;

        if (song == songs_per_category[category] && category != songs_per_category.length - 1) {
            par.innerHTML += '<br><br>Kategori ' + (category+2) + ': ' + (categories[category]) + ': ' + (songs_per_category[category+1]*2) + 'p';
            song = 0;
            category += 1;
        }
    }
   
}

