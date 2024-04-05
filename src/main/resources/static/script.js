const signupPage = document.querySelector('#signup-page');
const signupForm = document.querySelector('#signupForm');
const signupUsername = document.querySelector('#signup-username');
const signupFullname = document.querySelector('#fullname');
const signupPassword = document.querySelector('#signup-password');

const loginPage = document.querySelector('#login-page');
const loginForm = document.querySelector('#loginForm');
const loginUsername = document.querySelector('#login-username');
const loginPassword = document.querySelector('#login-password');

const welcomePage = document.querySelector('#welcome-page');
const displayUsername = document.querySelector('#display-username');
const displayFullname = document.querySelector('#display-fullname');
const logoutButton = document.querySelector('#logout');

const loginButton = document.querySelector('#login');
const signupButton = document.querySelector('#signup');

signupForm.addEventListener('submit', signup);
loginForm.addEventListener('submit', login);
logoutButton.addEventListener('click', logout);

loginButton.addEventListener('click', switchToLogin);
signupButton.addEventListener('click', switchToSignup)

let user = null;

//const socket = new SockJS('/ws');
//const stompClient = Stomp.over(socket);
//stompClient.connect({}, onConnected, onError);

async function signup(event) {
    event.preventDefault();
    let username = signupUsername.value.trim();
    let fullname = signupFullname.value.trim();
    let password = signupPassword.value.trim();

    if (username && fullname && password) {
        userData = {
            username: username,
            fullname: fullname,
            password: password};

        try {
            const response = await fetch('/user.signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const isSuccessful = await response.json();

            if (isSuccessful === true) {
                // Signup successful, show welcome page
                signupPage.classList.add('hidden');
                await displayUserInfos(username);
            } else {
                alert('Signup failed. Username Already in use. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Unexpected error occurred during signup. Please try again later.');
        }
    }
}


async function login(event) {
    event.preventDefault();
    let username = loginUsername.value.trim();
    let password = loginPassword.value.trim();

    if (username && fullname && password) {
        userCredentials = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('/user.login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            });

            const isSuccessful = await response.json();

            if (isSuccessful === true) {
                // Login successful, show welcome page
                loginPage.classList.add('hidden');
                await displayUserInfos(username);
            } else {
                alert('Login failed. Username and password combination not found. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Unexpected error occurred during login. Please try again later.');
        }
    }
}

async function logout(event) {
    event.preventDefault();
    let username = displayUsername.textContent;

    if (username) {
        userCredentials = {
            username: username
        };

        try {
            const response = await fetch('/user.logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            });

            const isSuccessful = await response.json();

            if (isSuccessful === true) {
                // Logout successful, show login page
                welcomePage.classList.add('hidden');
                loginPage.classList.remove('hidden');
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Unexpected error occurred during logout. Please try again later.');
        }
    }
}

async function displayUserInfos(username) {
    welcomePage.classList.remove('hidden');
    displayUsername.textContent = username;

    userCredentials = {
        username: username
    };

    const response = await fetch('/user.infos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCredentials)
    });

    const userInfos = await response.json();
    if (userInfos) {
        displayFullname.textContent = `Welcome ${userInfos.fullname} !`;
    }

}

/*
function onConnected() {
    stompClient.subscribe('/app/user.signup', onSignupSuccess);
    stompClient.subscribe('/app/user.login', onLoginSuccess);
    stompClient.subscribe('/app/user', onLoginSuccess);
}

function onError(error) {
    console.error('Error connecting to WebSocket:', error);
}
*/

function switchToLogin() {
    signupPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

function switchToSignup() {
    signupPage.classList.remove('hidden');
    loginPage.classList.add('hidden');
}


