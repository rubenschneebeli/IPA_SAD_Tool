package com.accenture.sad_tool.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.mock-user.username}")
    private String mockUsername;

    @Value("${app.mock-user.password}")
    private String mockPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername(mockUsername).isEmpty()) {
            AppUser user = new AppUser();
            user.setUsername(mockUsername);
            user.setPassword(passwordEncoder.encode(mockPassword));
            userRepository.save(user);
        }
    }
}
