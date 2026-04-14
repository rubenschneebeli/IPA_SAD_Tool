package com.accenture.sad_tool.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<SadDocument, UUID> {

    List<SadDocument> findAllByTemplateId(UUID templateId);
}
