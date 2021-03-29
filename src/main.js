import { fileToDataUrl } from './helpers.js';
import { errorPopup } from './helpers.js';
import { successPopup } from './helpers.js';
import { showCommentPage } from './display.js';
import { showUpdateDetailsPage } from './display.js';
import { showCreatePostPage } from './display.js';
import { showUpdatePostPage } from './display.js';
import { loadRegistrationPage } from './display.js';
import { loadLoginPage } from './display.js';
import { displayDashboard } from './display.js';
import { displayProfilePage } from './display.js';
import { loadDashboard } from './load.js';
import { loadUserFeed } from './load.js';
import { loadUserProfile } from './load.js';

window.onhashchange = loadHashPage;
function loadHashPage() {
    let hash = location.hash;
    switch (hash) {
        case "#login":
            loadLoginPage();
            break;
        case "#createPost":
            showCreatePostPage();
            break;
        case "#registration":
            loadRegistrationPage();
            break;
        case "#dashboard":
            displayDashboard();
            break;
        case "#update":
            showUpdateDetailsPage();
            break;
        case "#comment":
            showCommentPage();
            break;
        case "#updatepost":
            showUpdatePostPage();
            break;
        default: 
            let username = hash.substring(1);
            loadUserProfile(username);
            displayProfilePage();
        }
} 

window.location.hash = "#login";

// setup infinite scroll
window.addEventListener('scroll', () => {
    let docElement = document.documentElement;
    let scrollTop = docElement.scrollTop;
    let scrollHeight = docElement.scrollHeight;
    let clientHeight = docElement.clientHeight;
    if (window.location.hash == "#dashboard") {
        if (scrollTop + clientHeight == scrollHeight) {
            let nPosts = document.getElementById("posts").childElementCount;
            let currPostIndex = nPosts;
            let nextIndex = currPostIndex + 10;
            fetch(`http://localhost:5000/user/feed?p=${currPostIndex}&?n=${nextIndex}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(feedQueryResponse => {
                if (feedQueryResponse.status == 200) {
                    feedQueryResponse.json().then(queryResults => {
                        loadUserFeed(queryResults.posts);
                    });
                } else {
                    errorPopup("Failed to fetch new posts")
                }
            })
        }
    } 
});


// event listener for logging in
document.getElementById('loginbutton').addEventListener("click", () => {
    let pw1 = document.getElementById('pw').value;
    let pw2 = document.getElementById('confirmpw').value;

    if (pw1 != pw2 ) {
        errorPopup("Passwords don't match, please try again.")
    } else {
        localStorage.setItem('currentUsername', document.getElementById('username').value);
        const loginBody = {
            "username": document.getElementById('username').value,
            "password": pw1,
        };
        fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginBody),
        }).then((data) => {
            if (data.status === 403) {
                errorPopup('Incorrect login details!');
            } else if (data.status === 200) {
                data.json().then((result) => {
                    // save auth token to local stoarage
                    localStorage.setItem('token', result.token);
                    loadDashboard();
                    var navButtons = document.getElementsByClassName("nav-item");
                    for (let i = 0; i < navButtons.length; i++) {
                        navButtons[i].style.display = "inline";
                    }

                    console.log('token is:',localStorage.getItem('token'));

                    // Get current user details
                    fetch(`http://localhost:5000/user/`, {
                        method: 'GET',
                        headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                    }).then((responseBody) => {
                        if (responseBody.status == 200) {
                            responseBody.json().then((currentUserDetails) => {
                                // save current user's ID to local storage
                                localStorage.setItem('currID', currentUserDetails.id);

                                // display dashboard
                                window.location.hash = "#dashboard";

                                // Setup create a post page
                                let createPostbutton = document.getElementById('createPostButton');
                                createPostbutton.addEventListener("click", () => {
                                    window.location.hash = "#createPost";
                                });
                                let submitPostButton = document.getElementById("submitPostButton");
                                submitPostButton.addEventListener("click", () => {
                                    let postDescription = document.getElementById("postInputArea").value;
                                    if (postDescription == '') {
                                        errorPopup("Please enter a description");
                                    }
                                    // read the file
                                    let imgFile = document.getElementById("imgSrc").files[0];
                                    try {
                                        fileToDataUrl(imgFile).then(url => {
                                            let splitUrl = url.split(',')[1];
                                            const postBody = {
                                                "description_text": postDescription,
                                                "src": splitUrl
                                            };
                                            fetch(`http://localhost:5000/post`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(postBody),
                                            }).then(createPostResponse => {
                                                if (createPostResponse.status == 200) {
                                                    createPostResponse.json().then(() => {
                                                        successPopup("Successfully created post!")
                                                    })
                                                } else {
                                                    errorPopup("Please enter a valid description or file. Accepted image formats are JPEG, PNG, and JPG");
                                                }
                                            });
                                        })
                                        .catch(err => {
                                            errorPopup(err);
                                        });    
                                    } catch {
                                        errorPopup("Please enter a valid description or file");
                                    }
                                });

                                // Setup button to view current user profile
                                let myProfileButton = document.getElementById('myProfileButton');
                                myProfileButton.addEventListener("click", () => {
                                    window.location.hash = "#" + localStorage.getItem('currentUsername');
                                });
                            })
                        } else {
                            errorPopup('Failed to fetch current user details from API');
                        }
                    });
                })
            }
        })  
    }
});

// event listener for registration
document.getElementById('confirmregistration').addEventListener("click", () => {
    let pw1 = document.getElementById('registerpw').value;
    let pw2 = document.getElementById('confirmregisterpw').value;

    if (pw1 != pw2) {
        errorPopup("Passwords don't match, please try again.");
    } else {
        const registrationBody = {
            "username": document.getElementById('registeruser').value,
            "password": pw1,
            "email": document.getElementById('email').value,
            "name": document.getElementById('name').value
        };
        try {
            fetch('http://localhost:5000/auth/signup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationBody),
            }).then((data) => {
                if (data.status === 200) {
                    successPopup('You have successfully registered! Please feel free to go back to the home page and login with your new account.');
                } else if (data.status == 409) {
                    errorPopup('This username is already in use, please choose another one.');
                } else {
                    errorPopup('Please fill out all fields');
                }
            });
        } catch {
            errorPopup('Please fill out all fields');
        }
    }
})

// event listener for going to registration page
document.getElementById('registerbutton').addEventListener("click", () => {
    window.location.hash = "#registration";
});

// event listener for going to back to home page from registration page
document.getElementById('homebutton').addEventListener("click", () => {
    window.location.hash = "#login";

});

// event listener for using home page button
document.getElementById('myDashboardButton').addEventListener("click", () => {
    window.location.hash = "#dashboard";
});