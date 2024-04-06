package org.ziyad.login.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/user.signup")
    public ResponseEntity<Boolean> signupUser (@RequestBody User user) {
        // true means signup successful, false means signup failed
        return ResponseEntity.ok(userService.signupUser(user));
    }

    @PutMapping("/user.login")
    public ResponseEntity<Boolean> loginUser (@RequestBody UserCredentials userCredentials) {
        // true means login successful, false means login failed
        return ResponseEntity.ok(userService.loginUser(userCredentials));
    }

    @PutMapping("/user.logout")
    public ResponseEntity<Boolean> logoutUser (@RequestBody UserCredentials userCredentials) {
        // true means login successful, false means login failed
        return ResponseEntity.ok(userService.logoutUser(userCredentials));
    }

    @GetMapping("/user.infos/{username}")
    public ResponseEntity<User> getUserInfos (@PathVariable("username") String username) {
        return ResponseEntity.ok(userService.getUserInfos(username));
    }

    @GetMapping("/users.online")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }

    @GetMapping("/users.all")
    public ResponseEntity<List<User>> findAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
}
