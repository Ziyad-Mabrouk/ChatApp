package org.ziyad.login.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;


    public boolean signupUser(User user) {
        List<User> existingUsers = findAllUsers();

        if (!existingUsers.isEmpty()) {
            for (User existingUser : existingUsers) {
                if (user.getUsername().equals(existingUser.getUsername())) {
                    return false; //signup failed
                }
            }
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setFriends(new HashSet<>());
        user.setStatus(Status.ONLINE);
        userRepository.save(user);
        return true; //signup successful
    }

    public boolean loginUser(UserCredentials userCredentials) {
        // true means login successful, false means login failed
        var storedUser = userRepository.findById(userCredentials.getUsername()).orElse(null);
        if (storedUser != null && passwordEncoder.matches(userCredentials.getPassword(), storedUser.getPassword())) {
            storedUser.setStatus(Status.ONLINE);
            userRepository.save(storedUser);
            return true;
        }
        return false;
    }

    public boolean logoutUser(UserCredentials userCredentials) {
        var storedUser = userRepository.findById(userCredentials.getUsername()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            userRepository.save(storedUser);
            return true;
        }
        return false;
    }

    public User getUserInfos(String username) {
        return userRepository.findById(username).orElse(null);
    }

    public List<User> findConnectedUsers() {
        return userRepository.findAllByStatus(Status.ONLINE);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public boolean addFriend(String username, String newFriendUsername) {
        User user = getUserInfos(username);
        // Check if newFriend's username exists
        User newFriend = userRepository.findById(newFriendUsername).orElse(null);
        if (newFriend == null) {
            return false; // username does not exist
        }
        // Add the new friend to the user's friends
        user.getFriends().add(newFriendUsername);
        userRepository.save(user);
        return true; // added successfully
    }

}
