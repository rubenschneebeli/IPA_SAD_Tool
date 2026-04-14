package com.accenture.sad_tool.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentDto {

    public static class CreateRequest {

        @NotBlank(message = "Title cannot be empty")
        private String title;

        @NotNull(message = "Tempalte ID cannot be empty")
        private UUID templateId;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public UUID getTemplateId() { return templateId; }
        public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    }

    public static class UpdateRequest {

        @NotBlank(message = "Title cannot be empty")
        private String title;

        @NotBlank(message = "HTML content cannot be empty")
        private String htmlContent;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getHtmlContent() { return htmlContent; }
        public void setHtmlContent(String htmlContent) { this.htmlContent = htmlContent; }
    }

    public static class Response {

        private UUID id;
        private String title;
        private String htmlContent;
        private UUID templateId;
        private String templateTitle;
        private String createdByUsername;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(SadDocument document) {
            Response response = new Response();
            response.id = document.getId();
            response.title = document.getTitle();
            response.htmlContent = document.getHtmlContent();
            response.templateId = document.getTemplate().getId();
            response.templateTitle = document.getTemplate().getTitle();
            if (document.getCreatedBy() != null) {
                response.createdByUsername = document.getCreatedBy().getUsername();
            }
            response.createdAt = document.getCreatedAt();
            response.updatedAt = document.getUpdatedAt();
            return response;
        }

        public UUID getId() { return id; }
        public String getTitle() { return title; }
        public String getHtmlContent() { return htmlContent; }
        public UUID getTemplateId() { return templateId; }
        public String getTemplateTitle() { return templateTitle; }
        public String getCreatedByUsername() { return createdByUsername; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }
}
