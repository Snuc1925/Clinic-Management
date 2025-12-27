package com.hust.clinic.service;

import com.hust.clinic.entity.User;
import com.hust.clinic.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setPhone("0123456789");
        testUser.setFullName("Test User");
        testUser.setAddress("123 Test St");
        testUser.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testUser.setPassword("encodedPassword");
    }

    @Test
    void testRegisterUser_Success() {
        // Arrange
        User newUser = new User();
        newUser.setPhone("0987654321");
        newUser.setFullName("New User");
        newUser.setAddress("456 New St");
        newUser.setDateOfBirth(LocalDate.of(1995, 5, 15));
        newUser.setPassword("password123");

        when(userRepository.existsByPhone(newUser.getPhone())).thenReturn(false);
        when(passwordEncoder.encode(newUser.getPassword())).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // Act
        User result = userService.registerUser(newUser);

        // Assert
        assertNotNull(result);
        verify(userRepository, times(1)).existsByPhone(newUser.getPhone());
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUser_PhoneNumberAlreadyExists() {
        // Arrange
        User newUser = new User();
        newUser.setPhone("0123456789");
        newUser.setFullName("Duplicate User");
        newUser.setPassword("password123");

        when(userRepository.existsByPhone(newUser.getPhone())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.registerUser(newUser);
        });

        assertEquals("Phone number already exists", exception.getMessage());
        verify(userRepository, times(1)).existsByPhone(newUser.getPhone());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetUserByPhone_Success() {
        // Arrange
        when(userRepository.findByPhone("0123456789")).thenReturn(Optional.of(testUser));

        // Act
        var result = userService.getUserByPhone("0123456789");

        // Assert
        assertNotNull(result);
        assertEquals("0123456789", result.getPhone());
        assertEquals("Test User", result.getFullName());
        verify(userRepository, times(1)).findByPhone("0123456789");
    }

    @Test
    void testGetUserByPhone_UserNotFound() {
        // Arrange
        when(userRepository.findByPhone("9999999999")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserByPhone("9999999999");
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findByPhone("9999999999");
    }

    @Test
    void testPasswordEncoding_OnRegistration() {
        // Arrange
        User newUser = new User();
        newUser.setPhone("0111111111");
        newUser.setPassword("plainPassword");

        when(userRepository.existsByPhone(newUser.getPhone())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPlainPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals("encodedPlainPassword", saved.getPassword());
            return saved;
        });

        // Act
        userService.registerUser(newUser);

        // Assert
        verify(passwordEncoder, times(1)).encode("plainPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }
}
