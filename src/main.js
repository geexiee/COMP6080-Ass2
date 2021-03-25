import DummyAPI from './api.js';
import AuthAPI from './api.js';
import UserAPI from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.
const dummyapi = new DummyAPI('http://localhost:5000');
const authapi = new AuthAPI('http://localhost:5000');
const userapi = new UserAPI('http://localhost:5000');

// Example usage of makeAPIRequest method.
// dummyapi.makeAPIRequest('dummy/user')
//     .then(r => console.log(r));

/* TODO LIST
1. view other profiles - fragment based url?bri
2. follow other users
3. error window with close button
4. feed pagination/infinite scroll
5. unlike | NOT NECESSARY
6. upate post | DONE
7. delete post | DONE
8. challenge components*/

/*QUESTIONS
1. do i have to actuallty have all the profiles preloaded
2. do i need to create the error window separately, is there an inbuilt solution :)
3. how to infinite scroll - scroll event listener (check if scrolled to bottom), or intersection observer (browser api, when empty div at the bottom reload stuff)
4. how to update instantly
*/



// event listener for logging in
document.getElementById('loginbutton').addEventListener("click", () => {
    let pw1 = document.getElementById('pw').value;
    let pw2 = document.getElementById('confirmpw').value;

    if (!checkPasswordMatch(pw1, pw2)) {
        errorPopup("Passwords don't match, please try again.")
    } else {
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
                    var navButtons = document.getElementsByClassName("nav-item");
                    for (let i = 0; i < navButtons.length; i++) {
                        navButtons[i].style.display = "inline";
                    }
                    document.getElementById('loginform').style.display = 'none';
                    let dashboard = document.getElementById('dashboard');
                    dashboard.style.display = 'flex';
                    dashboard.style.flexDirection = 'column';
                    console.log('token is:',result.token);


                    // Get current user details
                    fetch(`http://localhost:5000/user/`, {
                        method: 'GET',
                        headers: {
                        'Authorization': `Token ${result.token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                    }).then((responseBody) => {
                        if (responseBody.status == 200) {
                            responseBody.json().then((currentUserDetails) => {

                                // Setup create a post button/page
                                let createPostbutton = document.getElementById('createPostButton');
                                createPostbutton.addEventListener("click", () => {
                                    showCreatePostPage();
                                });
                                let submitPostButton = document.getElementById("submitPostButton");
                                submitPostButton.addEventListener("click", () => {
                                    let postDescription = document.getElementById("postInputArea").value;
                                    // read the file
                                    let imgFile = document.getElementById("imgSrc").files[0];
                                    fileToDataUrl(imgFile).then(url => {
                                        let splitUrl = url.split(',')[1];
                                        const postBody = {
                                            "description_text": postDescription,
                                            "src": splitUrl
                                        };
                                        fetch(`http://localhost:5000/post`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Token ${result.token}`,
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(postBody),
                                        }).then(createPostResponse => {
                                            if (createPostResponse.status == 200) {
                                                createPostResponse.json().then(postResponse => {
                                                    alert("successfully created post!")
                                                })
                                            } else {
                                                alert("failed to call create post API");
                                            }
                                        });
                                    })
                                    .catch(err => {
                                        alert(err);
                                    });    
                                });

                                // Setup current user profile page
                                let profilePageDiv = document.getElementById('profilePageDiv'); 
                                profilePageDiv.innerText = `Username: ${currentUserDetails.username} 
                                                            Email: ${currentUserDetails.email}
                                                            Name:  ${currentUserDetails.name}`;
                                let updateDetailsButton = document.createElement("button");
                                updateDetailsButton.innerText = "Update Details";
                                updateDetailsButton.addEventListener("click", () => {
                                    showUpdateDetailsPage();
                                })

                                // Add event listener for updating details
                                document.getElementById("submitUpdatedDetailsButton").addEventListener("click", () => {
                                    let newEmail = document.getElementById("updatedEmail").value;
                                    let newName = document.getElementById("updatedName").value;
                                    let newPassword = document.getElementById("updatedPassword").value;
                                    if (newPassword == '' || newName == '' || newEmail == '') {
                                        alert("Please do not enter any empty fields");
                                    } 
                                    const updatedDetailsBody = {
                                        "email": newEmail,
                                        "name": newName,
                                        "password": newPassword
                                    }
                                    
                                    fetch(`http://localhost:5000/user`, {
                                        method: 'PUT',
                                        headers: {
                                            'Authorization': `Token ${result.token}`,
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(updatedDetailsBody),
                                    }).then(updateResponse => {
                                        if (updateResponse.status == 200) {
                                            alert("successfully updated details!");
                                        } else {
                                            alert("Couldnt update details, you fucked up buddy");
                                        }
                                    })
                                })
                                profilePageDiv.appendChild(updateDetailsButton);

                                for (let post of currentUserDetails.posts) {
                                    fetch(`http://localhost:5000/post?id=${post}`, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': `Token ${result.token}`,
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                    }).then((individualpostresponse) => {
                                        if (individualpostresponse.status != 200) {
                                            alert('you fucked up buddy');
                                        } else {
                                            individualpostresponse.json().then((individualpostjson) => {
                                                let postsDiv = document.getElementById("profilePageDiv");
                                                
                                                // creating individual tile for each post
                                                let postTile = document.createElement('div');
                                                postTile.className = "postTile";

                                                // adding ID to the tile
                                                postTile.innerText = `Post ID: ${individualpostjson.id}\n`;
                                                
                                                // adding author to the tile
                                                let authorTitle = document.createElement('text');
                                                let authorName = document.createElement('text');
                                                authorName.className = "authorName";
                                                authorTitle.innerText = `Author: `;
                                                authorName.innerText = `${individualpostjson.meta.author}`
                                                authorName.addEventListener("click", () => {
                                                    alert('clicked on this dudes name idiot');
                                                });
                                                postTile.appendChild(authorTitle);
                                                postTile.appendChild(authorName);

                                                // adding published date to the tile
                                                let published = document.createElement('div');
                                                let unixtimestamp = individualpostjson.meta.published;
                                                let publishedDate = new Date(unixtimestamp * 1000);
                                                publishedDate = publishedDate.toLocaleString();
                                                published.innerText = `Published: ` + publishedDate;
                                                postTile.appendChild(published);

                                                // adding image to the tile
                                                let image = document.createElement('img');
                                                image.setAttribute('src', `data:image/jpeg;base64, ${individualpostjson.src}`);
                                                postTile.appendChild(image);

                                                // adding post description to the tile
                                                let description = document.createElement('div');
                                                description.innerText = `Description: ${individualpostjson.meta.description_text}`;
                                                postTile.appendChild(description);

                                                // adding number of likes to the tile
                                                let numlikes = document.createElement('div');
                                                let nlikes = individualpostjson.meta.likes.length;
                                                // getting names of people who likes the post
                                                let uselikes = new Array();
                                                for (let userID of individualpostjson.meta.likes) {
                                                    fetch(`http://localhost:5000/user?id=${userID}`, {
                                                        method: 'GET',
                                                        headers: {
                                                            'Authorization': `Token ${result.token}`,
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json'
                                                        },
                                                    }).then(fetchUsernameResponse => {
                                                        if (fetchUsernameResponse.status == 200) {
                                                            fetchUsernameResponse.json().then(userDetails => {
                                                                uselikes.push(userDetails.username);
                                                            })
                                                        }
                                                    });
                                                }
                                                numlikes.innerText = `Likes: ${nlikes}\n Liked by: ${individualpostjson.meta.likes}`;
                                                postTile.appendChild(numlikes);

                                                // Adding like button
                                                var likeButton = document.createElement("button");
                                                likeButton.innerText = "Like";
                                                likeButton.addEventListener("click", () => {
                                                    fetch(`http://localhost:5000/post/like?id=${individualpostjson.id}`, {
                                                        method: 'PUT',
                                                        headers: {
                                                        'Authorization': `Token ${result.token}`,
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json'
                                                        },
                                                    });
                                                });
                                                postTile.appendChild(likeButton);

                                                // Adding comment button
                                                var commentButton = document.createElement("button");
                                                commentButton.innerText = "Comment";
                                                commentButton.addEventListener("click", () => {
                                                    showCommentPage();
                                                    // Add API call and event listener for submitting comment
                                                    document.getElementById("submitCommentButton").addEventListener("click", () => {
                                                        const commentInputBody = {
                                                            "comment": document.getElementById("commentInputArea").value
                                                        };
                                                        fetch(`http://localhost:5000/post/comment?id=${individualpostjson.id}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Authorization': `Token ${result.token}`,
                                                                'Accept': 'application/json',
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify(commentInputBody),
                                                        }).then(commentInputReponse => {
                                                            if (commentInputReponse.status == 200) {
                                                                alert("successfully posted comment!");
                                                            } else {
                                                                alert("Couldnt post comment");
                                                            }
                                                        });
                                                    });
                                                });
                                                postTile.appendChild(commentButton);

                                                // Adding update post button
                                                var updatePostButton = document.createElement("button");
                                                updatePostButton.innerText = "Update";
                                                updatePostButton.addEventListener("click", () => {
                                                    showUpdatePostPage();
                                                    // Add API call and event listener for updating post
                                                    document.getElementById("updatePostButton").addEventListener("click", () => {
                                                        let updatedPostDescription = document.getElementById("updatePostInputArea").value;
                                                        // read the file
                                                        let imgFile = document.getElementById("updateImgSrc").files[0];
                                                        fileToDataUrl(imgFile).then(url => {
                                                            let splitUrl = url.split(',')[1];
                                                            const updatedPostBody = {
                                                                "description_text": updatedPostDescription,
                                                                "src": splitUrl
                                                            };
                                                            fetch(`http://localhost:5000/post/?id=${individualpostjson.id}`, {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Authorization': `Token ${result.token}`,
                                                                    'Accept': 'application/json',
                                                                    'Content-Type': 'application/json'
                                                                },
                                                                body: JSON.stringify(updatedPostBody),
                                                            }).then(updatePostResponse => {
                                                                if (updatePostResponse.status == 200) {
                                                                    alert("successfully udpated post!");
                                                                } else {
                                                                    alert("failed to call update post API");
                                                                }
                                                            });
                                                        })
                                                        .catch(err => {
                                                            alert(err);
                                                        });  
                                                    });
                                                });
                                                postTile.appendChild(updatePostButton)                                                
                                                
                                                // Adding delete post button
                                                var deletePostButton = document.createElement("button");
                                                deletePostButton.innerText = "Delete";
                                                deletePostButton.addEventListener("click", () => {
                                                    // Add API call and event listener for deleting post
                                                    fetch(`http://localhost:5000/post/?id=${individualpostjson.id}`, {
                                                        method: 'DELETE',
                                                        headers: {
                                                            'Authorization': `Token ${result.token}`,
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json'
                                                        },
                                                    }).then(deletePostReponse => {
                                                        if (deletePostReponse.status == 200) {
                                                            alert("successfully deleted post!");
                                                        } else {
                                                            alert("Couldnt delete post");
                                                        }
                                                    });
                                                });
                                                postTile.appendChild(deletePostButton)

                                                // adding number of comments to the tile
                                                let numcomments = document.createElement('div');
                                                let ncomments = individualpostjson.comments.length;
                                                numcomments.innerText = `Comments: ${ncomments}`; 
                                                postTile.appendChild(numcomments);
                                                // Adding each comment 
                                                for (let commentdata of individualpostjson.comments) {
                                                    let comment = document.createElement('div');
                                                    comment.className = "commentDiv"

                                                    let unixtimestamp = commentdata.published;
                                                    let publishedDate = new Date(unixtimestamp * 1000);
                                                    publishedDate = publishedDate.toLocaleString();
                                                    comment.innerText = `${commentdata.comment} \n Commented by: ${commentdata.author} at ${publishedDate}`;
                                                    postTile.appendChild(comment);
                                                }
                                                postsDiv.appendChild(postTile);
                                            })
                                        }
                                    })
                                }
                                // Setup update details page

                                
                                // Setup button to view current user profile
                                let myProfileButton = document.getElementById('myProfileButton');
                                myProfileButton.addEventListener("click", () => {
                                    document.getElementById('dashboard').style.display = "none";
                                    document.getElementById('profilePageDiv').style.display = "flex";
                                    document.getElementById('profilePageDiv').style.flexDirection = 'column';    
                                    document.getElementById('profile').style.display = "flex";
                                    document.getElementById('profile').style.flexDirection = 'column';    
                                    document.getElementById('createPostPageDiv').style.display = 'none';
                                    document.getElementById('updateDetailsPageDiv').style.display = 'none';
                                    document.getElementById('addCommentPageDiv').style.display = 'none';
                                    document.getElementById('updatePostPageDiv').style.display = 'none';
});

                                // Setup current users feed
                                fetch('http://localhost:5000/user/feed', {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Token ${result.token}`,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                }).then((rawposts) => {
                                    if (rawposts.status == 200) {
                                        rawposts.json().then((posts) => {
                                            console.log(posts);
                                            for (let post of posts.posts) {
                                                fetch(`http://localhost:5000/post?id=${post.id}`, {
                                                    method: 'GET',
                                                    headers: {
                                                        'Authorization': `Token ${result.token}`,
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json'
                                                    },
                                                }).then((individualpostresponse) => {
                                                    if (individualpostresponse.status != 200) {
                                                        alert('you fucked up buddy');
                                                    } else {
                                                        individualpostresponse.json().then((individualpostjson) => {
                                                            let postsDiv = document.getElementById("posts");
                                                            
                                                            // creating individual tile for each post
                                                            let postTile = document.createElement('div');
                                                            postTile.className = "postTile";
            
                                                            // adding ID to the tile
                                                            postTile.innerText = `Post ID: ${individualpostjson.id}\n`;
                                                            
                                                            // adding author to the tile
                                                            let authorTitle = document.createElement('text');
                                                            let authorName = document.createElement('text');
                                                            authorName.className = "authorName";
                                                            authorTitle.innerText = `Author: `;
                                                            authorName.innerText = `${individualpostjson.meta.author}`
                                                            authorName.addEventListener("click", () => {
                                                                alert('clicked on this dudes name idiot');
                                                            });
                                                            postTile.appendChild(authorTitle);
                                                            postTile.appendChild(authorName);
            
                                                            // adding published date to the tile
                                                            let published = document.createElement('div');
                                                            let unixtimestamp = individualpostjson.meta.published;
                                                            let publishedDate = new Date(unixtimestamp * 1000);
                                                            publishedDate = publishedDate.toLocaleString();
                                                            published.innerText = `Published: ` + publishedDate;
                                                            postTile.appendChild(published);
            
                                                            // adding image to the tile
                                                            let image = document.createElement('img');
                                                            image.setAttribute('src', `data:image/jpeg;base64, ${individualpostjson.src}`);
                                                            postTile.appendChild(image);
            
                                                            // adding post description to the tile
                                                            let description = document.createElement('div');
                                                            description.innerText = `Description: ${individualpostjson.meta.description_text}`;
                                                            postTile.appendChild(description);
            
                                                            // adding number of likes to the tile
                                                            let numlikes = document.createElement('div');
                                                            let nlikes = individualpostjson.meta.likes.length;
                                                            numlikes.innerText = `Likes: ${nlikes}\n Liked by: `;
                                                            postTile.appendChild(numlikes);
                                                            // getting names of people who likes the post
                                                            for (let userID of individualpostjson.meta.likes) {
                                                                fetch(`http://localhost:5000/user?id=${userID}`, {
                                                                    method: 'GET',
                                                                    headers: {
                                                                        'Authorization': `Token ${result.token}`,
                                                                        'Accept': 'application/json',
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                }).then(fetchUsernameResponse => {
                                                                    if (fetchUsernameResponse.status == 200) {
                                                                        fetchUsernameResponse.json().then(userDetails => {
                                                                            let likeUser = document.createElement('text');
                                                                            likeUser.className = 'authorName';
                                                                            likeUser.innerText = ` ${userDetails.username}`;
                                                                            numlikes.appendChild(likeUser);
                                                                        })
                                                                    }
                                                                });
                                                            }
            
                                                            // Adding like button
                                                            var button = document.createElement("button");
                                                            button.innerHTML = "Like";
                                                            button.addEventListener("click", () => {
                                                                fetch(`http://localhost:5000/post/like?id=${individualpostjson['id']}`, {
                                                                    method: 'PUT',
                                                                    headers: {
                                                                    'Authorization': `Token ${result.token}`,
                                                                    'Accept': 'application/json',
                                                                    'Content-Type': 'application/json'
                                                                    },
                                                                });
                                                            });
                                                            postTile.appendChild(button);

                                                            // Adding comment button
                                                            var commentButton = document.createElement("button");
                                                            commentButton.innerText = "Comment";
                                                            commentButton.addEventListener("click", () => {
                                                                showCommentPage();
                                                                // Add API call and event listener for submitting comment
                                                                document.getElementById("submitCommentButton").addEventListener("click", () => {
                                                                    let comment = document.getElementById("commentInputArea").value;
                                                                    if (comment == '') {
                                                                        alert("please input a comment");
                                                                    } else {
                                                                        const commentInputBody = {
                                                                            "comment": comment
                                                                        };
                                                                        fetch(`http://localhost:5000/post/comment?id=${individualpostjson.id}`, {
                                                                            method: 'PUT',
                                                                            headers: {
                                                                                'Authorization': `Token ${result.token}`,
                                                                                'Accept': 'application/json',
                                                                                'Content-Type': 'application/json'
                                                                            },
                                                                            body: JSON.stringify(commentInputBody),
                                                                        }).then(commentInputReponse => {
                                                                            if (commentInputReponse.status == 200) {
                                                                                document.getElementById("commentInputArea").value = '';
                                                                                alert("successfully posted comment!");
                                                                            } else {
                                                                                alert("Couldnt post comment");
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                            postTile.appendChild(commentButton);
            
                                                            // adding number of comments to the tile
                                                            let numcomments = document.createElement('div');
                                                            let ncomments = individualpostjson.comments.length;
                                                            numcomments.innerText = `Comments: ${ncomments}`; 
                                                            postTile.appendChild(numcomments);
                                                            // Adding each comment 
                                                            for (let commentdata of individualpostjson.comments) {
                                                                let comment = document.createElement('div');
                                                                comment.className = "commentDiv"
            
                                                                let unixtimestamp = commentdata.published;
                                                                let publishedDate = new Date(unixtimestamp * 1000);
                                                                publishedDate = publishedDate.toLocaleString();
                                                                let commentName = createNameLink(commentdata.author);
                                                                comment.innerText = `${commentdata.comment} \n Commented at ${publishedDate} by: `;
                                                                comment.appendChild(commentName);
                                                                postTile.appendChild(comment);
                                                            }
                                                            postsDiv.appendChild(postTile);
                                                        })
                                                    }
                                                })
                                            }
                                        });
                                    } else if (rawposts.status == 403) {
                                        alert('bad request!');
                                    }
                                });
                            })
                        } else {
                            alert('failed to fetch current user details');
                        }
                    });
                })
            }
        })  
    }
});

// Function for creating name link (returns text element)
function createNameLink(name) {
    let nameLink = document.createElement('text');
    nameLink.className = "authorName";
    nameLink.innerText = name;
    return nameLink;
}

// Function for getting user info from a token, user, and ID
function getOtherUserInfo(token, username, id) {
    fetch(`http://localhost:5000/user/?username=${username}?id=${id}`, {
        method: 'GET',
        headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then((response) => {
        if (response.status == 200) {
            response.json().then( (responsebody) => {
                return responsebody;
            });
        } else {
            return -1;
        }
    })
};

// Function for getting current user info using only auth token. Returns json response body if successful, -1 if not
function getCurrentUserInfo(token) {
    fetch(`http://localhost:5000/user/`, {
        method: 'GET',
        headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then((response) => {
        if (response.status == 200) {
            return response.json().then;
        } else {
            return -1;
        }
    })
};

// Function for checking if a value exists in a JS object
function isValueInObject(value, object) {
    for (let i in object) {
        if (object[i] === value) {
            return true;
        }
    }
    return false;
}

// event listener for registration
document.getElementById('confirmregistration').addEventListener("click", () => {
    let pw1 = document.getElementById('registerpw').value;
    let pw2 = document.getElementById('confirmregisterpw').value;

    if (!checkPasswordMatch(pw1,pw2)) {
        alert("Passwords don't match, please try again.");
    } else {
        const registrationBody = {
            "username": document.getElementById('registeruser').value,
            "password": pw1,
            "email": document.getElementById('email').value,
            "name": document.getElementById('name').value
        };
        const result = fetch('http://localhost:5000/auth/signup', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationBody),
        }).then((data) => {
            console.log(data);
            if (data.status === 400) {
                alert('Missing username/password');
            } else if (data.status === 200) {
                alert('You have successfully registered! Please feel free to go back to the home page and login with your new account.');
                data.json().then(result => {
                    console.log(result);
                })
            }
        })
    }
})

// Function for checking passwords 
function checkPasswordMatch(pw1, pw2) {
    if (pw1 != pw2) {
        return false;
    }
    return true
}

// Function for displaying errors
function errorPopup(message) {
    window.confirm(message);
}

// event listener for going to registration page
document.getElementById('registerbutton').addEventListener("click", () => {
    document.getElementById('loginform').style.display = 'none';
    document.getElementById('loginform').reset();
    document.getElementById('registrationform').style.display = 'flex';    
    document.getElementById('registrationform').style.flexDirection = 'column';    
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
})

// event listener for going to back to home page from registration page
document.getElementById('homebutton').addEventListener("click", () => {
    document.getElementById('registrationform').reset();
    document.getElementById('registrationform').style.display = 'none';
    document.getElementById('loginform').style.display = 'flex';   
    document.getElementById('createPostPageDiv').style.display = 'none'; 
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
})

// event listener for using home page button
document.getElementById('homeButton').addEventListener("click", () => {
    let dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'flex';
    dashboard.style.flexDirection = 'column'; 
    document.getElementById('profilePageDiv').style.display = "none";
    document.getElementById('profile').style.display = "none";
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
})

// Function for showing the comment page
function showCommentPage() {
    document.getElementById('dashboard').style.display = "none";
    document.getElementById('profilePageDiv').style.display = "none";
    document.getElementById('profile').style.display = "none";
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'inline';
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing the update details page
function showUpdateDetailsPage() {
    document.getElementById('dashboard').style.display = "none";
    document.getElementById('profilePageDiv').style.display = "none";
    document.getElementById('profile').style.display = "none";
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updateDetailsPageDiv').style.display = 'inline';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing create a post page
function showCreatePostPage() {
    document.getElementById("loginflex").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPostPageDiv").style.display = "inline";
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing update post page
function showUpdatePostPage() {
    document.getElementById("loginflex").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPostPageDiv").style.display = "none";
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'inline';
}