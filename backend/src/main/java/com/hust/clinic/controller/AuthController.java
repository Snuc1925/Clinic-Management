package com.hust.clinic.controller;

import com.hust.clinic.dto.JwtResponse;
import com.hust.clinic.dto.LoginRequest;
import com.hust.clinic.dto.RegisterRequest;
import com.hust.clinic.dto.UserResponse;
import com.hust.clinic.entity.User;
import com.hust.clinic.security.JwtUtil;
import com.hust.clinic.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getPhone(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        UserResponse user = userService.getUserByPhone(userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = new User(
                    registerRequest.getPhone(),
                    registerRequest.getFullName(),
                    registerRequest.getAddress(),
                    registerRequest.getDateOfBirth(),
                    registerRequest.getPassword()
            );

            User registeredUser = userService.registerUser(user);

            return ResponseEntity.ok().body("{\"message\": \"User registered successfully\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
