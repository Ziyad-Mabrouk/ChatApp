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
    const response = await fetch(`/user.infos/${username}`);
    const currentUser = await response.json();
    const friends = currentUser.friends || []; // If friends is null, default to an empty array
    console.log(friends); //!!
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    // Fetch user details for each friend username
    for (const friendUsername of friends) {
        const friendResponse = await fetch(`/user.infos/${friendUsername}`);
        const friend = await friendResponse.json();
        appendUserElement(friend, connectedUsersList);
        if (friends.indexOf(friendUsername) < friends.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    }
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const userImage = document.createElement('img');
    userImage.src = 'img/user_icon.png';
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
    //console.log(selectedUserId);
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
        const userResponse = await fetch(`/user.addfriend/${username}/${newFriend}`,
            {method: 'POST'});

        const isSuccessful = await userResponse.json();

        if (isSuccessful) {
            const response = await fetch(`/canal.new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([username, newFriend])
            });


            if (response.ok ) {
                alert(`Successfully added ${newFriend} as a friend.`);
                await findAndDisplayConnectedUsers();
            }
        } else {
            console.error(`Failed to add ${newFriend} as a friend.`);
            alert(`Failed to add ${newFriend} as a friend. Please try again.`);
        }
    }
    await findAndDisplayConnectedUsers();
}

async function sendMessage(event) {
    //should be modified later on when chatroom support is put in place
    event.preventDefault();
    const messageContent = messageInput.value.trim();
    if (messageContent && selectedUserId && stompClient) {
        const recipients = [username, selectedUserId];
        recipients.sort(); //canal names always follow alphabetical order
        const canalName = recipients.join("_");
        console.log(canalName);
        const canalResponse = await fetch(`/canal.find/${canalName}`);
        const canal = await canalResponse.json();
        if (canal) {
            const message = {
                canalId: canal.canalId,
                sender: username,
                content: messageContent
            };
            stompClient.send("/app/chat", {}, JSON.stringify(message));
            displayMessage(username, messageInput.value.trim(), new Date());
            messageInput.value = '';
        }
    } else {
        alert('Please select a recipient and enter a message.');
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}

function displayMessage(senderId, content, timestamp) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const message = document.createElement('div');
    message.classList.add('message');

    if (senderId === username) {
        message.classList.add('sender');
        messageContainer.classList.add('from-sender');
    } else {
        message.classList.add('receiver');
        messageContainer.classList.add('from-receiver');
    }
    const message_content = document.createElement('p');
    message_content.textContent = content;

    const formattedTimestamp = formatDate(timestamp);
    const date = document.createElement('span');
    date.textContent = formattedTimestamp;

    message.appendChild(message_content);
    messageContainer.appendChild(message);
    messageContainer.appendChild(date);
    chatArea.appendChild(messageContainer);
}

const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
};

const formats = {
    prefix: "",
    suffix: " ago",
    now: "just now",
    future: "in the future",
    seconds: "less than a minute"
};

function getRelativeTime(diffInSeconds) {
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / secondsInUnit);
        if (interval > 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ${formats.suffix}`;
        }
    }
    return formats.now;
}


function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);

    let formattedDate;
    if (diff < 0) {
        formattedDate = 'Invalid Date';
    } else if (diff < 0) {
        formattedDate = formats.future;
    } else if (seconds < 5) {
        formattedDate = formats.now;
    } else {
        formattedDate = getRelativeTime(seconds);
    }

    return formattedDate;
}

async function fetchAndDisplayUserChat() {
    const recipients = [username, selectedUserId];
    recipients.sort(); //canal names always follow alphabetical order
    const canalName = recipients.join("_");
    console.log(canalName);
    const canalResponse = await fetch(`/canal.find/${canalName}`);
    const canal = await canalResponse.json();
    const userChatResponse = await fetch(`/messages/${canal.canalId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.sender, chat.content, chat.timestamp);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Call the function to update timestamps every minute
setInterval(fetchAndDisplayUserChat, 60000);

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
        displayMessage(message.sender, message.content, message.timestamp);
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