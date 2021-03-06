import { createNameLink } from './helpers.js';
import { followUser } from './helpers.js';
import { errorPopup } from './helpers.js';
import { unfollowUser } from './helpers.js';
import { successPopup } from './helpers.js';
import { GetSortOrder } from './helpers.js';


/* 
This file contains functions used for loading pages in the website. This includes: 
loadUserProfile(username), loadUserFeed(), and loadDashboard() 
*/

// Function for loading given users profile
export function loadUserProfile(username) {
    // Get current user details
    fetch(`http://localhost:5000/user/?username=${username}`, {
        method: 'GET',
        headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    }).then((responseBody) => {
        if (responseBody.status == 200) {
            responseBody.json().then((currentUserDetails) => {
                // Setup current user profile page
                let profilePageDiv = document.getElementById('profilePageDiv');
                profilePageDiv.innerText = `Username: ${currentUserDetails.username} 
                                            Email: ${currentUserDetails.email}
                                            Name:  ${currentUserDetails.name}
                                            Number of Followers: ${currentUserDetails.followed_num}`;
                let followingText = document.createElement("text");
                followingText.innerText = "Currently Following:";
                profilePageDiv.appendChild(followingText);

                for (let id of currentUserDetails.following) {
                    fetch(`http://localhost:5000/user?id=${id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    }).then(fetchUsernameResponse => {
                        if (fetchUsernameResponse.status == 200) {
                            fetchUsernameResponse.json().then(userDetails => {
                                let followingUser = createNameLink(` ${userDetails.username}`);
                                followingUser.addEventListener("click", () => {
                                    window.location.hash = `${userDetails.username}`;
                                })
                                followingText.appendChild(followingUser);
                            })
                        }
                    });  
                }

                // Only add update option if profile is of current user
                if (localStorage.getItem('currentUsername') == username) {
                    let updateDetailsButton = document.createElement("button");
                    updateDetailsButton.innerText = "Update Details";
                    updateDetailsButton.addEventListener("click", () => {
                        window.location.hash = "#update";
                    });
                    // Add event listener for updating details
                    document.getElementById("submitUpdatedDetailsButton").addEventListener("click", () => {
                        let newEmail = document.getElementById("updatedEmail").value;
                        let newName = document.getElementById("updatedName").value;
                        let newPassword = document.getElementById("updatedPassword").value;
                        if (newPassword == '' || newName == '' || newEmail == '') {
                            errorPopup("Please do not enter any empty fields");
                        } else {
                            const updatedDetailsBody = {
                                "email": newEmail,
                                "name": newName,
                                "password": newPassword
                            }
                            
                            fetch(`http://localhost:5000/user`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updatedDetailsBody),
                            }).then(updateResponse => {
                                if (updateResponse.status == 200) {
                                    successPopup("Successfully updated details!");
                                } else {
                                    errorPopup("Couldn't update details");
                                }
                            });
                        }
                    });
                    profilePageDiv.appendChild(updateDetailsButton);
                }

                // only add follow button if profile is of another user
                if (localStorage.getItem('currentUsername') != username) {
                    let followButton = document.createElement("button");
                    followButton.innerText = "Follow";
                    followButton.addEventListener("click", () => {
                        fetch(`http://localhost:5000/user?id=${localStorage.getItem('currID')}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Token ${localStorage.getItem('token')}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                        }).then(updateResponse => {
                            if (updateResponse.status == 200) {
                                updateResponse.json().then(response => {
                                    if (response.following.includes(currentUserDetails.id)) {
                                        unfollowUser(username);
                                    } else {
                                        followUser(username);
                                    }
                                });
                            } else {
                                errorPopup("Couldnt get currently logged in user info");
                            }
                        });
                    });
                    profilePageDiv.appendChild(followButton);
                }

                for (let post of currentUserDetails.posts) {
                    fetch(`http://localhost:5000/post?id=${post}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    }).then((individualpostresponse) => {
                        if (individualpostresponse.status != 200) {
                            errorPopup('API call failed');
                        } else {
                            individualpostresponse.json().then((individualpostjson) => {
                                let postsDiv = document.getElementById("profilePageDiv");
                                
                                // creating individual tile for each post
                                let postTile = document.createElement('div');
                                postTile.className = "postTile";

                                // adding author to the tile
                                let authorTitle = document.createElement('text');
                                let authorName = document.createElement('text');
                                authorName.className = "authorName";
                                authorTitle.innerText = `Author: `;
                                authorName.innerText = `${individualpostjson.meta.author}`
                                authorName.addEventListener("click", () => {
                                    window.location.hash = `${individualpostjson.meta.author}`
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
                                image.alt = "Sorry, we could not display this image at this time. Please check your network connection.";
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
                                            'Authorization': `Token ${localStorage.getItem('token')}`,
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                    }).then(fetchUsernameResponse => {
                                        if (fetchUsernameResponse.status == 200) {
                                            fetchUsernameResponse.json().then(userDetails => {
                                                let likeUser = createNameLink(` ${userDetails.username}`);
                                                numlikes.appendChild(likeUser);
                                            })
                                        }
                                    });
                                }

                                // Adding like button
                                var likeButton = document.createElement("button");
                                likeButton.innerText = "Like";
                                likeButton.addEventListener("click", () => {
                                    fetch(`http://localhost:5000/post/like?id=${individualpostjson.id}`, {
                                        method: 'PUT',
                                        headers: {
                                        'Authorization': `Token ${localStorage.getItem('token')}`,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                        },
                                    });
                                    successPopup("Successfully liked!");
                                });
                                postTile.appendChild(likeButton);

                                // Adding comment button
                                var commentButton = document.createElement("button");
                                commentButton.innerText = "Comment";
                                commentButton.addEventListener("click", () => {
                                    window.location.hash = "#comment";
                                    // Add API call and event listener for submitting comment
                                    document.getElementById("submitCommentButton").addEventListener("click", () => {
                                        let comment = document.getElementById("commentInputArea").value;
                                        if (comment == '') {
                                            errorPopup("Please input a comment");
                                        } else {
                                            console.log(`${individualpostjson.id}`);
                                            const commentInputBody = {
                                                "comment": comment
                                            };
                                            fetch(`http://localhost:5000/post/comment?id=${individualpostjson.id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(commentInputBody),
                                            }).then(commentInputReponse => {
                                                if (commentInputReponse.status == 200) {
                                                    document.getElementById("commentInputArea").value = '';
                                                    successPopup("Successfully posted comment!");
                                                } else {
                                                    errorPopup("Please input a valid (non empty) comment");
                                                }
                                            });
                                        }
                                    });
                                });
                                postTile.appendChild(commentButton);

                                // only add update/delete buttons if its the current users profile
                                if (localStorage.getItem('currentUsername') == username) {
                                    // Adding update post button
                                    var updatePostButton = document.createElement("button");
                                    updatePostButton.innerText = "Update";
                                    updatePostButton.addEventListener("click", () => {
                                        window.location.hash = "#updatepost";
                                        // Add API call and event listener for updating post
                                        document.getElementById("updatePostButton").addEventListener("click", () => {
                                            let updatedPostDescription = document.getElementById("updatePostInputArea").value;
                                            if (updatedPostDescription != '') {
                                                try {
                                                    const updatedPostBody = {
                                                        "description_text": updatedPostDescription,
                                                    };
                                                    fetch(`http://localhost:5000/post/?id=${individualpostjson.id}`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Authorization': `Token ${localStorage.getItem('token')}`,
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify(updatedPostBody),
                                                    }).then(updatePostResponse => {
                                                        if (updatePostResponse.status == 200) {
                                                            successPopup("successfully updated post!");
                                                        } else {
                                                            errorPopup("Failed to call update post API. Please ensure all fields are filled out.");
                                                        }
                                                    });
                                                } catch {
                                                    errorPopup("Please enter a valid description");
                                                } 
                                            } else {
                                                errorPopup("Please enter a valid description");
                                            }
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
                                                'Authorization': `Token ${localStorage.getItem('token')}`,
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json'
                                            },
                                        }).then(deletePostReponse => {
                                            if (deletePostReponse.status == 200) {
                                                successPopup("successfully deleted post!");
                                            } else {
                                                errorPopup("Couldnt delete post");
                                            }
                                        });
                                    });
                                    postTile.appendChild(deletePostButton)
                                }

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
            })
        } else {
            errorPopup('Failed to fetch current user details');
        }
    });
}

// Function for loading dashboard
export function loadDashboard() {
    fetch('http://localhost:5000/user/feed', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((rawposts) => {
        if (rawposts.status == 200) {
            rawposts.json().then((posts) => {
                var postList = posts.posts;
                postList.sort(GetSortOrder("published"));
                for (let post of postList) {
                    fetch(`http://localhost:5000/post?id=${post.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    }).then((individualpostresponse) => {
                        if (individualpostresponse.status != 200) {
                            errorPopup('Failed to call post loading API');
                        } else {
                            individualpostresponse.json().then((individualpostjson) => {
                                let postsDiv = document.getElementById("posts");
                                
                                // creating individual tile for each post
                                let postTile = document.createElement('div');
                                postTile.className = "postTile";

                                // adding author to the tile
                                let authorTitle = document.createElement('text');
                                let authorName = document.createElement('text');
                                authorName.className = "authorName";
                                authorTitle.innerText = `Author: `;
                                authorName.innerText = `${individualpostjson.meta.author}`
                                authorName.addEventListener("click", () => {
                                    window.location.hash = `#${individualpostjson.meta.author}`
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
                                image.alt = "Sorry, we could not display this image at this time. Please check your network connection.";
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
                                            'Authorization': `Token ${localStorage.getItem('token')}`,
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
                                                likeUser.addEventListener("click", () => {
                                                    window.location.hash = likeUser.innerText;
                                                })
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
                                        'Authorization': `Token ${localStorage.getItem('token')}`,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                        },
                                    });
                                    successPopup("Successfully liked!");
                                });
                                postTile.appendChild(button);

                                // Adding comment button
                                var commentButton = document.createElement("button");
                                commentButton.innerText = "Comment";
                                commentButton.addEventListener("click", () => {
                                    window.location.hash = "#comment";
                                    // Add API call and event listener for submitting comment
                                    document.getElementById("submitCommentButton").addEventListener("click", () => {
                                        let comment = document.getElementById("commentInputArea").value;
                                        if (comment == '') {
                                            errorPopup("Please input a comment");
                                        } else {
                                            const commentInputBody = {
                                                "comment": comment
                                            };
                                            fetch(`http://localhost:5000/post/comment?id=${individualpostjson.id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(commentInputBody),
                                            }).then(commentInputReponse => {
                                                if (commentInputReponse.status == 200) {
                                                    document.getElementById("commentInputArea").value = '';
                                                    successPopup("successfully posted comment!");
                                                } else {
                                                    errorPopup("Please input a valid (non empty) comment");
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
            errorPopup('bad request!');
        }
    });
}

// Function for loading feed for the infinite scroll
export function loadUserFeed(postList) {
    for (let post of postList) {
        fetch(`http://localhost:5000/post?id=${post.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then((individualpostresponse) => {
            if (individualpostresponse.status != 200) {
                errorPopup('Failed to call post loading API');
            } else {
                individualpostresponse.json().then((individualpostjson) => {
                    let postsDiv = document.getElementById("posts");
                    
                    // creating individual tile for each post
                    let postTile = document.createElement('div');
                    postTile.className = "postTile";

                    // adding author to the tile
                    let authorTitle = document.createElement('text');
                    let authorName = document.createElement('text');
                    authorName.className = "authorName";
                    authorTitle.innerText = `Author: `;
                    authorName.innerText = `${individualpostjson.meta.author}`
                    authorName.addEventListener("click", () => {
                        window.location.hash = `#${individualpostjson.meta.author}`
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
                    image.alt = "Sorry, we could not display this image at this time. Please check your network connection.";
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
                                'Authorization': `Token ${localStorage.getItem('token')}`,
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
                                    likeUser.addEventListener("click", () => {
                                        window.location.hash = likeUser.innerText;
                                    })
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
                            'Authorization': `Token ${localStorage.getItem('token')}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            },
                        });
                        successPopup("Successfully liked!");
                    });
                    postTile.appendChild(button);

                    // Adding comment button
                    var commentButton = document.createElement("button");
                    commentButton.innerText = "Comment";
                    commentButton.addEventListener("click", () => {
                        window.location.hash = "#comment";
                        // Add API call and event listener for submitting comment
                        document.getElementById("submitCommentButton").addEventListener("click", () => {
                            let comment = document.getElementById("commentInputArea").value;
                            if (comment == '') {
                                errorPopup("Please input a comment");
                            } else {
                                const commentInputBody = {
                                    "comment": comment
                                };
                                fetch(`http://localhost:5000/post/comment?id=${individualpostjson.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': `Token ${localStorage.getItem('token')}`,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(commentInputBody),
                                }).then(commentInputReponse => {
                                    if (commentInputReponse.status == 200) {
                                        document.getElementById("commentInputArea").value = '';
                                        successPopup("Successfully posted comment!");
                                    } else {
                                        errorPopup("Please input a valid (non empty) comment");
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
}

