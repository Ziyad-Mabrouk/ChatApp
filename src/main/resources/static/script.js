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

const addFriendForm = document.querySelector('#friendForm');
const addFriendInput = document.querySelector('#add-username');

const chatPage = document.querySelector('#chat-page');
const chatArea = document.querySelector('#chat-messages');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');

const connectingElement = document.querySelector('.connecting');
const connectedUsersList = document.querySelector('#connectedUsers');

const loginButton = document.querySelector('#login');
const signupButton = document.querySelector('#signup');

signupForm.addEventListener('submit', signup);
loginForm.addEventListener('submit', login);
logoutButton.addEventListener('click', logout);
addFriendForm.addEventListener('submit', addFriend);
messageForm.addEventListener('submit', sendMessage);

loginButton.addEventListener('click', switchToLogin);
signupButton.addEventListener('click', switchToSignup)

let stompClient = null;
let selectedUserId = null;
let username = null;
let fullname = null;

async function signup(event) {
    event.preventDefault();
    username = signupUsername.value.trim();
    let fullname = signupFullname.value.trim();
    let password = signupPassword.value.trim();

    if (username && fullname && password) {
        const userData = {
            username: username,
            fullname: fullname,
            password: password
        };

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
                connectWebSocket(username);
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
    username = loginUsername.value.trim();
    let password = loginPassword.value.trim();

    if (username && password) {
        const userCredentials = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('/user.login', {
                method: 'PUT',
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
                connectWebSocket(username);
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

    if (username) {
        const userCredentials = {
            username: username
        };

        try {
            const response = await fetch('/user.logout', {
                method: 'PUT',
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
                disconnectWebSocket();
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

    const response = await fetch(`/user.infos/${username}`);

    const userInfos = await response.json();
    if (userInfos) {
        displayFullname.textContent = `Welcome ${userInfos.fullname} !`;
        fullname = userInfos.fullname;
    }

    // Fetch and display online users
    findAndDisplayConnectedUsers().then();
}

async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users.online');
    let connectedUsers = await connectedUsersResponse.json();
    connectedUsers = connectedUsers.filter(user => user.username !== username);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullname;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';

}

function switchToLogin() {
    signupPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

function switchToSignup() {
    signupPage.classList.remove('hidden');
    loginPage.classList.add('hidden');
}

async function addFriend(event) {
    event.preventDefault();
    const newFriend = addFriendInput.value.trim();
    addFriendInput.value = '';
    if (newFriend) {
        const response = await fetch(`/canal.new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([username, newFriend])
        });
        if (response.ok) {
            alert(`Added ${newFriend} as a friend.`);
            await findAndDisplayConnectedUsers();
        } else {
            console.error(`Failed to add ${newFriend} as a friend.`);
            alert(`Failed to add ${newFriend} as a friend. Please try again.`);
        }
    }
}

async function sendMessage(event) {
    event.preventDefault();
    const messageContent = messageInput.value.trim();
    const recipient = selectedUserId;
    if (messageContent && recipient && stompClient) {
        const canalResponse = await fetch(`/canal.find/${username+"_"+recipient}`);
        const canal = await canalResponse.json();
        const message = {
            canalId: canal.canalId,
            sender: username,
            content: messageContent
        };
        stompClient.send("/app/chat", {}, JSON.stringify(message));
        displayMessage(username, messageInput.value.trim());
        messageInput.value = '';
    } else {
        alert('Please select a recipient and enter a message.');
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}

function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === username) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const canalResponse = await fetch(`/canal.find/${username+"_"+selectedUserId}`);
    const canal = await canalResponse.json();
    const userChatResponse = await fetch(`/messages/${canal.canalId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.sender, chat.content);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

function connectWebSocket(username) {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
    });
}

async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.sender) {
        displayMessage(message.sender, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.sender}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function disconnectWebSocket() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
}

window.onbeforeunload = () => logout();