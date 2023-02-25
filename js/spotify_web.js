let week = 7;
let year = 2023;

function clear_input_field(id) {
    let input_field = document.getElementById(id);
    if (input_field.value != "") {
        input_field.value = "";
    }
}

//Authenticate with Spotify API and get access token
function full_request(client_id, client_secret) {

    clear_generated_list();
    
    let input_field = document.getElementById("input_spotify_link");
    let playlist_url = input_field.value;
    
    clear_input_field("input_spotify_link")

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

    let categories = document.getElementById("list_category_names").getElementsByTagName("li");
    let songs_per_category = document.getElementById("list_category_sizes").getElementsByTagName("li");
    console.log(categories);
    console.log(songs_per_category);

    var par = document.getElementById("p");
 
    let category = 0;
    console.log(categories[category].textContent);
    let song = 0;
    par.innerHTML += '<br>Facit MQ v.' + week + ' (' + year + ')<br><br>';
    par.innerHTML += 'Kategori ' +  (category+1) + ': ' + (categories[category].textContent) + ': ' + (songs_per_category[category].textContent*2) + 'p';

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

        if (song == songs_per_category[category].textContent && category != songs_per_category.length - 1) {
            par.innerHTML += '<br><br>Kategori ' + (category+2) + ': ' + (categories[category+1].textContent) + ': ' + (songs_per_category[category+1].textContent*2) + 'p';
            song = 0;
            category += 1;
        }
    }
   
}

function clear_generated_list() {
    let list_field = document.getElementById("p");
    list_field.innerHTML = 'Generated List:<br>';
}

function add_category() {

    var category_names_list = document.getElementById("list_category_names");
    var category = document.getElementById("category_name");
    var li = document.createElement("li");
    li.setAttribute('id', category.value);
    li.appendChild(document.createTextNode(category.value));
    category_names_list.appendChild(li);

    var category_sizes_list = document.getElementById("list_category_sizes");
    var category_size = document.getElementById("category_size");
    var li2 = document.createElement("li");
    li2.setAttribute('id', category_size.value);
    li2.appendChild(document.createTextNode(category_size.value));
    category_sizes_list.appendChild(li2);

    clear_input_field("category_name")
    clear_input_field("category_size")

}

function remove_category() {

    var category_names_list = document.getElementById("list_category_names");
    var category = document.getElementById("category_name");
    var name = document.getElementById(category.value);
    var index_to_remove = Array.prototype.indexOf.call(category_names_list.children, name)
    category_names_list.removeChild(name);

    var category_sizes_list = document.getElementById("list_category_sizes");
    category_sizes_list.removeChild(category_sizes_list.children[index_to_remove]);

    clear_input_field("category_name")
    clear_input_field("category_size")
    
}

