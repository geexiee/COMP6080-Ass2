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
        throw Error('Provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

// Function for creating username link (returns text element)
export function createNameLink(name) {
    let nameLink = document.createElement('text');
    nameLink.className = "authorName";
    nameLink.innerText = name;
    nameLink.addEventListener("click", () => {
        window.location.hash = name;
    });
    return nameLink;
}

// Function for following other users
export function followUser(username) {
    try {
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
                    successPopup('Successfully followed user!');
                });
            } else {
                errorPopup("API call to follow the user failed");
            }
        });
    } catch {
        errorPopup("Failed to call follow API");
    }
}

// Function for unfollowing other users
export function unfollowUser(username) {
    try {
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
                    successPopup('Successfully unfollowed user!');
                });
            } else {
                errorPopup("API call to unfollow the user failed");
            }
        });
    } catch {
        errorPopup("Failed to call unfollow API");
    }
}

// Function for displaying errors
export function errorPopup(message) {
    document.getElementById("modalBody").innerText = message;
    document.getElementById("exampleModalLabel").innerText = "Error";
    $("#myModal").modal();
}

// Function for displaying success messages
export function successPopup(message) {
    document.getElementById("modalBody").innerText = message;
    document.getElementById("exampleModalLabel").innerText = "Success!";
    $("#myModal").modal();
}

//Comparer Function    
export function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a.meta.prop > b.meta.prop) {    
            return 1;    
        } else if (a.meta.prop < b.meta.prop) {    
            return -1;    
        }    
        return 0;    
    }    
}