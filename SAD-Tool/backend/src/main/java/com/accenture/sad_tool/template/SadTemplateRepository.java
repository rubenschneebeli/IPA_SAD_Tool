package com.accenture.sad_tool.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SadTemplateRepository extends JpaRepository<SadTemplate, UUID> {

    List<SadTemplate> findAllByDeletedAtIsNull();
    Optional<SadTemplate> findByIdAndDeletedAtIsNull(UUID id);
}
