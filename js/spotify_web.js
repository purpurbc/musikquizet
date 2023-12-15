
// Done! A file called 'My Document.docx' will be in your file system.
let week = 0;
let year = new Date().getFullYear();
var generated_text = "";

// Calculate the current week
const currentDate = new Date();
const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year
const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
const weekNumber = Math.floor((currentDate - startOfYear) / millisecondsInWeek) + 1;

week = weekNumber;

const startDOCX = () => {

    let doc = new docx.Document();

    const all_lines = generated_text.split(/\r?\n/);
    var paragraphs = [];

    all_lines.forEach((line, i) => {
        const new_par = new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: line
                })
            ]
        });
        paragraphs.push(new_par)
    });

    doc.addSection({
        children: paragraphs
    });

    docx.Packer.toBlob(doc).then( blob => {
        saveAs(blob, all_lines[0] + '.docx')
    });
}

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

    list_field.innerHTML = 'Genererad lista:<br>';

    if(document.getElementById('generate_docx_btn')) {
        document.getElementById('generate_docx_btn').remove();
    }

    if(document.getElementById('generate_pptx_btn')) {
        document.getElementById('generate_pptx_btn').remove();
    }
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
    generated_text = '';

    let input_field = document.getElementById("input_spotify_link");
    let playlist_url = input_field.value;
    if (!playlist_url) {
        return;
    }

    //clear_input_field("input_spotify_link");

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

    let num_options = [];
    let options = [];
    let cur_options = ""
    let options_c = 0
    for (const child of draggables.children) {

        let num_opt = 0;
        cur_options = child.children[2].value;
        for (let i = 0; i < cur_options.length; i++) {
            if (cur_options[i] === "+") {
                num_opt++;
            }
        }
        num_options[options_c] = num_opt + 1;
        options[options_c] = cur_options
        options_c += 1
    }

    //console.log(categories);
    //console.log(songs_per_category);

    var par = document.getElementById("p");

    let category = 0;
    //console.log(categories[category]);
    let song = 0;
    let song_count = 0;

    par.innerHTML += '<br>Facit MQ v.' + week + ' (' + year + ')<br><br>';
    par.innerHTML += 'Kategori ' +  (category+1) + ': ' + (categories[category]) + ': ' + (num_options[category]*songs_per_category[category]) + 'p';
    par.innerHTML += '<br>' + options[category]; //Låt + Artist';

    generated_text += 'Facit MQ v.' + week + ' (' + year + ')\n\n';
    generated_text += 'Kategori ' +  (category+1) + ': ' + (categories[category]) + ': ' + (num_options[category]*songs_per_category[category]) + 'p';
    generated_text += '\n' + options[category]; // '\nLåt + Artist';
    //Print each track's name and artist

    let num_of_songs = 0;
    for (let j = 0; j < songs_per_category.length; j++) {
        num_of_songs += parseInt(songs_per_category[j]);
    }

    //console.log(playlist_data['tracks']['items'])
    //console.log(playlist_data['tracks']['items'][i]['track']['artists'][0]['name'])
    for (const i in playlist_data['tracks']['items']) {

        let track_name = playlist_data['tracks']['items'][i]['track']['name'];
        //console.log(track_name);
        let track_artists = '';
        let num_artists = playlist_data['tracks']['items'][i]['track']['artists']['length'];
        for (const artist in playlist_data['tracks']['items'][i]['track']['artists']) {
            //console.log(artist)
            track_artists += playlist_data['tracks']['items'][i]['track']['artists'][artist]['name'];
            if (artist < num_artists-1) {
                track_artists += ', '
            }
        }
        //console.log(track_artists);
        par.innerHTML += '<br>' + (song+1) +'. ' + track_name + ' - ' + track_artists;
        generated_text += '\n' + (song+1) +'. ' + track_name + ' - ' + track_artists;

        song += 1;

        if (song == songs_per_category[category] && category != songs_per_category.length - 1) {
            par.innerHTML += '<br><br>Kategori ' + (category+2) + ': ' + (categories[category+1]) + ': ' + (num_options[category+1]*songs_per_category[category+1]) + 'p';
            par.innerHTML += '<br>' + options[category+1]; //'<br>Låt + Artist';
            generated_text += '\n\nKategori ' + (category+2) + ': ' + (categories[category+1]) + ': ' + (num_options[category+1]*songs_per_category[category+1]) + 'p';
            generated_text += '\n' + options[category+1]; //'\nLåt + Artist';
            song = 0;
            category += 1;
        }

        song_count += 1;
        if (num_of_songs == song_count)
        {
            break;
        }
    }

    var max_points = 0;
    let max_p_counter = 0;
    songs_per_category.forEach(item => {
        max_points += parseInt(item)*num_options[max_p_counter];
        max_p_counter += 1;

    });

    par.innerHTML += '<br><br>MAXPOÄNG: '  + max_points + 'p';
    generated_text += '\n\nMAXPOÄNG: ' + max_points + 'p';

    var content_div = document.getElementById("buttons_downl");
    var download_docx_btn = document.createElement("button");
    download_docx_btn.setAttribute('id', "generate_docx_btn");
    download_docx_btn.setAttribute('class', "button button_download");
    download_docx_btn.appendChild(document.createTextNode("facit"));

    var download_pptx_btn = document.createElement("button");
    download_pptx_btn.setAttribute('id', "generate_pptx_btn");
    download_pptx_btn.setAttribute('class', "button button_download_pptx");
    download_pptx_btn.appendChild(document.createTextNode("powerpoint"));

    // Append everything to the draggable container
    content_div.appendChild(download_docx_btn);
    content_div.appendChild(download_pptx_btn);

    document.querySelector('#generate_docx_btn').addEventListener('click', () => {
        startDOCX();
    })

    document.querySelector('#generate_pptx_btn').addEventListener('click', () => {
        createPresentation();
    })
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
        //console.log("Trying to grab a child element! Stop");
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

    var category_options = document.getElementById("category_options");

    add_draggable(category_name.value, category_size.value, category_options.value);

    clear_input_field("category_name");
    clear_input_field("category_size");
    clear_input_field("category_options");
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
function add_draggable(category_name, category_size, category_options) {

    var draggable_list = document.getElementById("draggable_list");

    // Create the new draggable container
    var new_draggable = document.createElement("div");
    new_draggable.setAttribute('class', "draggable");
    new_draggable.setAttribute('style', "");

    // Create the div for the category name, size and the button to remove the draggable
    var name_input_area = document.createElement("input");
    name_input_area.setAttribute('type','text');
    name_input_area.setAttribute('class','category');
    name_input_area.setAttribute('placeholder','Namn');
    name_input_area.setAttribute('size','25');
    name_input_area.setAttribute('value',category_name);
    name_input_area.setAttribute('style',"border-style: solid;border-radius: 3px;border: #E6E6E6;border-style: solid;border-width: 1px;")

    var size_input_area = document.createElement("input");
    size_input_area.setAttribute('type','text');
    size_input_area.setAttribute('class','category');
    size_input_area.setAttribute('placeholder','Storlek');
    size_input_area.setAttribute('id','size_input_area');
    size_input_area.setAttribute('size','1%');
    size_input_area.setAttribute('minlength','1');
    size_input_area.setAttribute('maxlength','2');
    size_input_area.setAttribute('value',category_size);
    size_input_area.setAttribute('style',"border-style: solid;border-radius: 3px;border: #E6E6E6;border-style: solid;border-width: 1px;")


    var categories_input_area = document.createElement("input");
    categories_input_area.setAttribute('type','text');
    categories_input_area.setAttribute('class','category');
    categories_input_area.setAttribute('placeholder','Låt+Artist+...');
    categories_input_area.setAttribute('size','25');
    categories_input_area.setAttribute('value',category_options);
    categories_input_area.setAttribute('style',"border-style: solid;border-radius: 3px;border: #E6E6E6;border-style: solid;border-width: 1px;")


    var new_remove_draggable_btn = document.createElement("button");
    new_remove_draggable_btn.setAttribute('id', "rmv_".concat(draggable_list.childElementCount+1,"_btn"));
    new_remove_draggable_btn.setAttribute('onclick', "remove_draggable(this.id)");
    new_remove_draggable_btn.setAttribute('class', "remove_draggable");
    new_remove_draggable_btn.setAttribute('style', "color:#BE6262;");

    new_remove_draggable_btn.appendChild(document.createTextNode("x"));

    // Append everything to the draggable container
    new_draggable.appendChild(name_input_area);
    new_draggable.appendChild(size_input_area);
    new_draggable.appendChild(categories_input_area);
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

add_draggable('Intro','6','Låt+Artist');
add_draggable('','6','Låt+Artist');
add_draggable('','6','Låt+Artist');
add_draggable('','6','Låt+Artist');
add_draggable('','6','Låt+Artist');
add_draggable('','6','Låt+Artist');

// Remove list item from list_category_names and list_category_sizes
function remove_draggable(id) {
    var btn = document.getElementById(id);
    var draggable = btn.parentElement;
    //console.log(draggable.className);
    draggable.remove();
    // Clear input fields
}



let num_songs_per_category = [2,2]; //[6,6,6,6,6,6];

//13.3 x 7.5 inches
let LAYOUT_WIDE_x = 13.3;
let LAYOUT_WIDE_y = 7.5;

let slide_center_x = LAYOUT_WIDE_x / 2;
let slide_center_y = LAYOUT_WIDE_y / 2;

function calc_center_xy(width,ratio) {
    let x = slide_center_x - width / 2
    let y = slide_center_y - (width*ratio) / 2
    return [x,y];
}

function addCenteredText(slide, text, fontSize, verticalPos) {
    let textOpts = {
        x: 0,
        y: verticalPos,
        w: LAYOUT_WIDE_x,
        h: 1,
        align: 'center',
        fontSize: fontSize
    };
    slide.addText(text, textOpts);
}

function createPresentation() {

    // Create a new presentation
    let pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    //=========================================================
    // BEGINNING - All Black Slide

    // Add an all-black slide as the beginning
    let slideBeginning = pptx.addSlide();
    slideBeginning.background = { fill: '000000' }; // Set background color to black

    //=========================================================


    //=========================================================
    // INTRO

    // Add an Intro Slide
    let slideIntro = pptx.addSlide();
    slideIntro.background = { path: "./images/background_1.png" };

    let logga_ratio = 1152 / 3099;
    let logga_width = 9;
    let logga_xy = calc_center_xy(logga_width,logga_ratio);

    let fbinsta_width = 0.8;
    let fbinsta_xy = [LAYOUT_WIDE_x - fbinsta_width - 0.1, 0.1]

    slideIntro.addImage({ path: "./images/musikquizet_logga.png", x: logga_xy[0], y: logga_xy[1], w: logga_width, h:logga_width*logga_ratio});
    slideIntro.addImage({ path: "./images/fb_insta.png", x: fbinsta_xy[0], y: fbinsta_xy[1], w: fbinsta_width, h:fbinsta_width*0.7});
    slideIntro.addText("@Musikquizet.tb", { x: fbinsta_xy[0] - 2.4, y: 0, w: 2.6, h:fbinsta_width*0.8, ...{ fontSize: 22, color: 'FFFFFF' } });

    //=========================================================


    //=========================================================
    // RULES

    // Add a Rules Slide
    let slideRules = pptx.addSlide();
    slideRules.background = { path: "./images/background_1.png" };

    // Define text style and margin for the Rules section
    let rulesTextStyle = { align: 'left', fontSize: 26, color: 'FFFFFF', margin: 10 };
    let rulesMarginLeft = 1.5; // Margin from the left edge
    let rulesSpacing = 1.4; // Vertical space between each rule

    // Add header text
    slideRules.addText("Regler / Rules", { x: rulesMarginLeft, y: 1, w: LAYOUT_WIDE_x - 2 * rulesMarginLeft, h: 0.5, ...rulesTextStyle, ...{ fontSize: 41, color: 'faecc3' }});

    // Add rule texts
    let rulesTexts = [
        "Rule 1: Fem (5) deltagare per lag. Five (5) people per team.",
        "Rule 2: Lämna in svarsformulären och era PENNOR på scenen under sista låten. Hand in your answer sheets and PENCILS during the last song of the night.",
        "Rule 3: Att fuska är INTE OKEJ! Everytime you cheat, a baby panda dies.",
        "Rule 4: Förstaplats vinner matbiljetter! 1st place wins food tickets to Kåren!"];
    for (let i = 0; i < rulesTexts.length; i++) {
        slideRules.addText(rulesTexts[i], { x: rulesMarginLeft, y: 1.4 + i * rulesSpacing, w: LAYOUT_WIDE_x - 2 * rulesMarginLeft, h: rulesSpacing, ...rulesTextStyle });
    }

    //=========================================================


    //=========================================================
    // MIDDLE

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

    let num_options = [];
    let options = [];
    let cur_options = ""
    let options_c = 0
    for (const child of draggables.children) {

        let num_opt = 0;
        cur_options = child.children[2].value;
        for (let i = 0; i < cur_options.length; i++) {
            if (cur_options[i] === "+") {
                num_opt++;
            }
        }
        num_options[options_c] = num_opt + 1;
        options[options_c] = cur_options
        options_c += 1
    }

    // Define text styles for different text sizes
    let superBigTextStyle = { align: 'center', fontSize: 90, color: 'faecc3' };
    let veryBigTextStyle = { align: 'center', fontSize: 41, color: 'faecc3' };
    let bigTextStyle = { align: 'center', fontSize: 34, color: 'faecc3' };
    let mediumTextStyle = { align: 'center', fontSize: 22, color: 'FFFFFF' };
    let smallTextStyle = { align: 'center', fontSize: 18, color: 'FFFFFF' };

    // Define the position and dimensions for the texts
    let textWidth = 10;
    let textHeight = 1;
    let textYOffset = 1; // Starting Y position for the first text
    let textYIncrement = 1.2; // Vertical space between texts

    // Add middle slides
    let slideNumber = 1; // Slide number within each category
    for (let category = 0; category < songs_per_category.length; category++) {
        for (let i = 0; i < songs_per_category[category]; i++) {
            let slide = pptx.addSlide();
            slide.background = { path: "./images/background_1.png" };

            // Add category header
            let categoryText = "KATEGORI " + (category + 1) + ": " + categories[category];
            slide.addText(categoryText, { x: slide_center_x - textWidth / 2, y: textYOffset, w: textWidth, h: textHeight, ...veryBigTextStyle });

            // Add other texts
            slide.addText("(" + options[category] + ")", { x: slide_center_x - textWidth / 2, y: textYOffset + 0.5, w: textWidth, h: textHeight, ...mediumTextStyle });
            slide.addText("Låt: " + (i+1), { x: slide_center_x - textWidth / 2, y: textYOffset + 1.7 * textYIncrement, w: textWidth, h: textHeight, ...superBigTextStyle });

            let fbinsta_xy_down = [LAYOUT_WIDE_x - fbinsta_width - 0.1, LAYOUT_WIDE_y - fbinsta_width*0.8 - 0.1]
            slide.addImage({ path: "./images/fb_insta.png", x: fbinsta_xy_down[0], y: fbinsta_xy_down[1], w: fbinsta_width, h:fbinsta_width*0.7});
            slide.addText("@Musikquizet.tb", { x: fbinsta_xy_down[0] - 2.4, y: fbinsta_xy_down[1] + 0.3, w: 2.6, h:fbinsta_xy_down*0.8, ...{ fontSize: 22, color: 'FFFFFF' } });

            let mini_logga_width = 2.6;
            let minilogga_xy = [LAYOUT_WIDE_x - mini_logga_width - 0.1, 0.1]
            slide.addImage({ path: "./images/musikquizet_logga.png", x: minilogga_xy[0], y: minilogga_xy[1], w: mini_logga_width, h:logga_ratio * mini_logga_width});

            if (category == 0)
            {
                let guess_text = "Gissa kategorins tema och rita det för en chans till 5 extra poäng! Guess this category’s theme and illustrate it for a chance of winning 5 extra points!";
                slide.addText(guess_text, { x: slide_center_x - 8.4 / 2, y: textYOffset + 3 * 1.3, w: 8.4, h: textHeight, ...mediumTextStyle });
                slide.addText("Låt kreativiteten flöda!", { x: slide_center_x - textWidth / 2, y: textYOffset + 3 * 1.3 + 1.0, w: textWidth, h: textHeight, ...bigTextStyle });
            }

            slideNumber++;
        }
        slideNumber = 1; // Reset slide number for next category
    }

    //=========================================================


    //=========================================================
    // WE WILL BE BACK

    // Add an End Slide
    let slideThanks = pptx.addSlide();
    slideThanks.background = { path: "./images/background_1.png" };

    // Add category header
    slideThanks.addText("Vi kommer tillbaka med ett resultat", { x: slide_center_x - textWidth / 2, y: textYOffset, w: textWidth, h: textHeight, ...veryBigTextStyle });

    // Add other texts
    slideThanks.addText("We will return with the results at", { x: slide_center_x - textWidth / 2, y: textYOffset + 0.5, w: textWidth, h: textHeight, ...mediumTextStyle });
    slideThanks.addText("kl.21:30", { x: slide_center_x - textWidth / 2, y: textYOffset + 1.7 * textYIncrement, w: textWidth, h: textHeight, ...superBigTextStyle });

    slideThanks.addText("Ni hittar veckans facit på vår facebooksida!", { x: slide_center_x - textWidth / 2, y: textYOffset + 3.3 * textYIncrement, w: textWidth, h: textHeight, ...mediumTextStyle });
    slideThanks.addText("@Musikquizet.tb", { x: slide_center_x - textWidth / 2, y: textYOffset + 3.7 * textYIncrement, w: textWidth, h: textHeight, ...bigTextStyle });

    let fbinsta_xy_down = [LAYOUT_WIDE_x - fbinsta_width - 0.1, LAYOUT_WIDE_y - fbinsta_width*0.8 - 0.1]
    slideThanks.addImage({ path: "./images/fb_insta.png", x: fbinsta_xy_down[0], y: fbinsta_xy_down[1], w: fbinsta_width, h:fbinsta_width*0.7});
    slideThanks.addText("@Musikquizet.tb", { x: fbinsta_xy_down[0] - 2.4, y: fbinsta_xy_down[1] + 0.3, w: 2.6, h:fbinsta_xy_down*0.8, ...{ fontSize: 22, color: 'FFFFFF' } });

    let mini_logga_width = 2.6;
    let minilogga_xy = [LAYOUT_WIDE_x - mini_logga_width - 0.1, 0.1]
    slideThanks.addImage({ path: "./images/musikquizet_logga.png", x: minilogga_xy[0], y: minilogga_xy[1], w: mini_logga_width, h:logga_ratio * mini_logga_width});


    //=========================================================


    //=========================================================
    // THE VERY END

    // Add an Intro Slide
    let slideEnd = pptx.addSlide();
    slideEnd.background = { path: "./images/background_1.png" };

    slideEnd.addImage({ path: "./images/musikquizet_logga.png", x: logga_xy[0], y: logga_xy[1], w: logga_width, h:logga_width*logga_ratio});
    slideEnd.addImage({ path: "./images/fb_insta.png", x: fbinsta_xy[0], y: fbinsta_xy[1], w: fbinsta_width, h:fbinsta_width*0.7});
    slideEnd.addText("@Musikquizet.tb", { x: fbinsta_xy[0] - 2.4, y: 0, w: 2.6, h:fbinsta_width*0.8, ...{ fontSize: 22, color: 'FFFFFF' } });

    //=========================================================


    // Save the Presentation
    pptx.writeFile({ fileName:  'Presentation MQ v.' + week + ' (' + year + ')'});
}
