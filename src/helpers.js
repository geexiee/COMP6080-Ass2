/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

// Function for creating name link (returns text element)
export function createNameLink(name) {
    let nameLink = document.createElement('text');
    nameLink.className = "authorName";
    nameLink.innerText = name;
    return nameLink;
}

// Function for following other users
export function followUser(username) {
    fetch(`http://localhost:5000/user/follow/?username=${username}`, {
        method: 'PUT',
        headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status == 200) {
            response.json().then(() => {
                alert('successfully followed user!');
            });
        } else {
            errorPopup("API call to follow the user failed");
        }
    });
}

// Function for unfollowing other users
export function unfollowUser(username) {
    fetch(`http://localhost:5000/user/unfollow/?username=${username}`, {
        method: 'PUT',
        headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status == 200) {
            response.json().then(() => {
                alert('successfully unfollowed user!');
            });
        } else {
            errorPopup("API call to unfollow the user failed");
        }
    });
}

export function idToUsername(id) {
    fetch(`http://localhost:5000/user/?id=${id}`, {
        method: 'GET',
        headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status == 200) {
            response.json().then(responseBody => {
                localStorage.setItem('followingUsername', responseBody.username);
            })
        } else {
            errorPopup("API call to find the username from a given ID failed");
        }
    });
}

// Function for displaying errors
export function errorPopup(message) {
    document.getElementById("modalBody").innerText = message;
    $("#myModal").modal();
}