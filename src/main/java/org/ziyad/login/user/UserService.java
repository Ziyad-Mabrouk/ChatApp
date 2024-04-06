package org.ziyad.login.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
