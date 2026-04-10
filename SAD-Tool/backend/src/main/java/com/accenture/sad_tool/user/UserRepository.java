package com.accenture.sad_tool.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByUsername(String username);
}
