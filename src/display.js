/*
This file contains functions used for displaying/hiding elements of the HTML 
to give the impression of moving between pages while maintaining SPA practices
*/

// Function for showing the comment page
export function showCommentPage() {
    document.getElementById('dashboard').style.display = "none";
    document.getElementById('profilePageDiv').style.display = "none";
    document.getElementById('profile').style.display = "none";
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'inline';
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing the update details page
export function showUpdateDetailsPage() {
    document.getElementById('dashboard').style.display = "none";
    document.getElementById('profilePageDiv').style.display = "none";
    document.getElementById('profile').style.display = "none";
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updateDetailsPageDiv').style.display = 'inline';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing create a post page
export function showCreatePostPage() {
    document.getElementById("loginflex").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPostPageDiv").style.display = "inline";
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing update post page
export function showUpdatePostPage() {
    document.getElementById("loginflex").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPostPageDiv").style.display = "none";
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'inline';
}

// Function for showing registration page
export function loadRegistrationPage() {
    document.getElementById('loginform').style.display = 'none';
    document.getElementById('loginform').reset();
    document.getElementById('registrationform').style.display = 'flex';    
    document.getElementById('registrationform').style.flexDirection = 'column';    
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing login page
export function loadLoginPage() {
    document.getElementById('registrationform').reset();
    document.getElementById('registrationform').style.display = 'none';
    document.getElementById('loginform').style.display = 'flex';   
    document.getElementById('createPostPageDiv').style.display = 'none'; 
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for showing dashboard
export function displayDashboard() {
    document.getElementById("loginflex").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";
    document.getElementById("dashboard").style.alignItems = "center";
    document.getElementById("dashboard").style.justifyContent = "center";
    document.getElementById("dashboard").style.flexDirection = "column"
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPostPageDiv").style.display = "none";
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}

// Function for displaying current user profile
export function displayProfilePage() {
    document.getElementById('dashboard').style.display = "none";
    document.getElementById('profilePageDiv').style.display = "flex";
    document.getElementById('profilePageDiv').style.flexDirection = 'column';    
    document.getElementById('profile').style.display = "flex";
    document.getElementById('profile').style.flexDirection = 'column';    
    document.getElementById('createPostPageDiv').style.display = 'none';
    document.getElementById('updateDetailsPageDiv').style.display = 'none';
    document.getElementById('addCommentPageDiv').style.display = 'none';
    document.getElementById('updatePostPageDiv').style.display = 'none';
}