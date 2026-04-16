package com.example.moviebooking.controller;

import com.example.moviebooking.dto.LoginRequest;
import com.example.moviebooking.dto.RegisterRequest;
import com.example.moviebooking.dto.UserResponse;
import com.example.moviebooking.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req) {
        UserResponse user = userService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest req) {
        UserResponse user = userService.login(req);
        return ResponseEntity.ok(user);
    }
}
