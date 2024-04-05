package org.ziyad.login.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

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

    @GetMapping("/user.infos")
    public ResponseEntity<User> getUserInfos (@RequestBody UserCredentials userCredentials) {
        return ResponseEntity.ok(userService.getUserInfos(userCredentials));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }
}
