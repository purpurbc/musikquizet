let week = 7;
let year = 2023;


//--------------------------------------------------------------//
//--------------------------------------------------------------//
//
//
//
//--------------------------------------------------------------//
//--------------------------------------------------------------//
// Helper functions

// Used to clear the input field of an input-element
function clear_input_field(id) {
    let input_field = document.getElementById(id);
    if (input_field.value != "") {
        input_field.value = "";
    }
}

// Used to clear the generated list
function clear_generated_list() {
    let list_field = document.getElementById("p");
    list_field.innerHTML = 'Generated List:<br>';
}

//--------------------------------------------------------------//
//--------------------------------------------------------------//
//
//
//
//--------------------------------------------------------------//
//--------------------------------------------------------------//
// For handling http requests with the Spotify API
/**
 * STEPS:
 * 1: Authenticate with Spotify API to ge the access token.
 *      This requires sending a POST request with client ID/SECRET to the API
 * 2: Use the access token to send a GET request to retrieve the plylist data
 * 3: Parse the data and create the list
*/

//Authenticate with Spotify API and get access token
function full_request(client_id, client_secret) {

    clear_generated_list();
    
    let input_field = document.getElementById("input_spotify_link");
    let playlist_url = input_field.value;
    
    clear_input_field("input_spotify_link");

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
            // alert(Http.response['access_token']);
            //document.body.innerHTML = "<h1>Success1</h1>";

            // Go to STEP 2
            return get_playlist_data(playlist_url, Http.response['access_token']);
        }
    }

    // Initiate the request with the correct parameters
    let params ='grant_type=client_credentials&client_id='.concat(client_id,'&client_secret=',client_secret);
    Http.send(params);
}

// Retrieve the playlist data with the asccess token
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
            // alert(Http.response['tracks']['items']);
            //document.body.innerHTML = "<h1>Success2</h1>";

            // Go to STEP 3 
            return parse_playlist_data(Http.response);
        }
    }

    //Initiate the request
    Http.send();
}

// Parse the data and create the list
function parse_playlist_data(playlist_data) {

    let draggables = document.getElementById("draggable_list");
    let categories = [];
    let num_categories = 0;
    for (const child of draggables.children) {
        categories[num_categories] = child.firstElementChild.value;
        num_categories += 1;
        
    }
    let songs_per_category = [];
    let counter = 0;
    for (const child of draggables.children) {
        songs_per_category[counter] = child.children[1].value;
        counter += 1;
    }
    console.log(categories);
    console.log(songs_per_category);

    var par = document.getElementById("p");
 
    let category = 0;
    console.log(categories[category]);
    let song = 0;
    par.innerHTML += '<br>Facit MQ v.' + week + ' (' + year + ')<br><br>';
    par.innerHTML += 'Kategori ' +  (category+1) + ': ' + (categories[category]) + ': ' + (songs_per_category[category]*2) + 'p';

    //Print each track's name and artist
    let i = 0;
    console.log(playlist_data['tracks']['items'])
    console.log(playlist_data['tracks']['items'][i]['track']['artists'][0]['name'])
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
            par.innerHTML += '<br><br>Kategori ' + (category+2) + ': ' + (categories[category+1]) + ': ' + (songs_per_category[category+1].textContent*2) + 'p';
            song = 0;
            category += 1;
        }
    }
}

//--------------------------------------------------------------//
//--------------------------------------------------------------//
//
//
//
//--------------------------------------------------------------//
//--------------------------------------------------------------//
// For dragging a category element
// Taken from https://htmldom.dev/drag-and-drop-element-in-a-list/ 26/02/26
// "Credit where credit's is due"

// The current dragging item
let draggingEle;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;
let prev_x = 0; //not in use
let prev_y = 0;

let placeholder;
let isDraggingStarted = false;

const mouseDownHandler = function (e) {
    draggingEle = e.target;

    //--------------------------------------------------------------//
    // My addition
    // The drag-effect wont be applied to the elements that are inside of the 
    // elements with the draggable class
    if( draggingEle.classList.contains("category") || 
        draggingEle.classList.contains("size") ||
        draggingEle.classList.contains("remove_draggable")) {

        draggingEle = e.target.parentNode;
        console.log("Trying to grab a child element! Stop");
    }
    //--------------------------------------------------------------//

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;
    prev_x = x;
    prev_y = y;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {

    const draggingRect = draggingEle.getBoundingClientRect();

    if (!isDraggingStarted) {
        // Update the flag
        isDraggingStarted = true;

        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(
            placeholder,
            draggingEle.nextSibling
        );

        // Set the placeholder's height
        placeholder.style.height = `${draggingRect.height}px`;
    }

    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    draggingEle.style.top = `${e.pageY - y}px`;
    draggingEle.style.left = `${e.pageX - x}px`;

    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;

    // User moves item to the top
    if (prevEle && isAbove(draggingEle, prevEle)) {
        // The current order    -> The new order
        // prevEle              -> placeholder
        // draggingEle          -> draggingEle
        // placeholder          -> prevEle
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }

    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
        // The current order    -> The new order
        // draggingEle          -> nextEle
        // placeholder          -> placeholder
        // nextEle              -> draggingEle
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
};

const mouseUpHandler = function () {

    // Remove the placeholder
    // Check if the placehoplder and its parentnode exist parent
    // Otherwise, the draggable will be stuck to the mouse if we click it
    (placeholder && placeholder.parentNode) && placeholder.parentNode.removeChild(placeholder);
    // Reset the flag
    isDraggingStarted = false;

    // Remove the position styles
    draggingEle.style.removeProperty('top');
    draggingEle.style.removeProperty('left');
    draggingEle.style.removeProperty('position');

    x = null;
    y = null;
    draggingEle = null;

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};



const isAbove = function (nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};

//--------------------------------------------------------------//
//--------------------------------------------------------------//
//
//
//
//--------------------------------------------------------------//
//--------------------------------------------------------------//
// Old code for creating and adding a category to a list

// Add list item to list_category_names and list_category_sizes
function add_category() {

    var category_name = document.getElementById("category_name");

    var category_size = document.getElementById("category_size");

    add_draggable(category_name.value, category_size.value);
    
    clear_input_field("category_name");
    clear_input_field("category_size");
}

// Remove list item from list_category_names and list_category_sizes
function remove_category() {

    var category_names_list = document.getElementById("list_category_names");
    var category = document.getElementById("category_name");
    var name = document.getElementById(category.value);
    var index_to_remove = Array.prototype.indexOf.call(category_names_list.children, name)
    category_names_list.removeChild(name);

    var category_sizes_list = document.getElementById("list_category_sizes");
    category_sizes_list.removeChild(category_sizes_list.children[index_to_remove]);

    clear_input_field("category_name");
    clear_input_field("category_size");
}

// Query the list element
const list = document.getElementById('draggable_list');

// Query all items
[].slice.call(list.querySelectorAll('.draggable')).forEach(function (item) {
    item.addEventListener('mousedown', mouseDownHandler);
});


Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

// Add list item to list_category_names and list_category_sizes
function add_draggable(category_name, category_size) {

    var draggable_list = document.getElementById("draggable_list");

    // Create the new draggable container
    var new_draggable = document.createElement("div");
    new_draggable.setAttribute('class', "draggable");
    new_draggable.setAttribute('style', "");

    // Create the div for the category name, size and the button to remove the draggable
    var name_input_area = document.createElement("input");
    name_input_area.setAttribute('type','text');
    name_input_area.setAttribute('class','category');
    name_input_area.setAttribute('placeholder','NAME');
    name_input_area.setAttribute('size','10');
    name_input_area.setAttribute('value',category_name);

    var size_input_area = document.createElement("input");
    size_input_area.setAttribute('type','number');
    size_input_area.setAttribute('class','category');
    size_input_area.setAttribute('placeholder','N');
    size_input_area.setAttribute('id','size_input_area');
    size_input_area.setAttribute('min','1');
    size_input_area.setAttribute('max','99');
    size_input_area.setAttribute('value',category_size);

    var new_remove_draggable_btn = document.createElement("button");
    new_remove_draggable_btn.setAttribute('id', "rmv_".concat(draggable_list.childElementCount+1,"_btn"));
    new_remove_draggable_btn.setAttribute('onclick', "remove_draggable(this.id)");
    new_remove_draggable_btn.setAttribute('class', "remove_draggable");
    new_remove_draggable_btn.appendChild(document.createTextNode("X"));

    // Append everything to the draggable container
    new_draggable.appendChild(name_input_area);
    new_draggable.appendChild(size_input_area);
    new_draggable.appendChild(new_remove_draggable_btn);

    // Append the draggable container to the list
    draggable_list.appendChild(new_draggable);

    // Query the list element
    const list = document.getElementById('draggable_list');

    // Query all items
    [].slice.call(list.querySelectorAll('.draggable')).forEach(function (item) {
        item.addEventListener('mousedown', mouseDownHandler);
    });

    // Clear the input fields
    clear_input_field("category_name");
    clear_input_field("category_size");
}

// Remove list item from list_category_names and list_category_sizes
function remove_draggable(id) {
    var btn = document.getElementById(id);
    var draggable = btn.parentElement;
    console.log(draggable.className);
    draggable.remove();
    // Clear input fields
}

