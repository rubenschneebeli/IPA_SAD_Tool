package com.accenture.sad_tool.template;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

public class TemplateDto {

    public static class Request {

        @NotBlank(message = "Title cannot be empty")
        private String title;

        @NotBlank(message = "Content cannot be empty")
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
        private String createdByUsername;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(SadTemplate template) {
            Response response = new Response();
            response.id = template.getId();
            response.title = template.getTitle();
            response.htmlContent = template.getHtmlContent();
            response.createdByUsername = template.getCreatedBy() != null
                ? template.getCreatedBy().getUsername() : null;
            response.createdAt = template.getCreatedAt();
            response.updatedAt = template.getUpdatedAt();
            return response;
        }

        public UUID getId() { return id; }
        public String getTitle() { return title; }
        public String getHtmlContent() { return htmlContent; }
        public String getCreatedByUsername() { return createdByUsername; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }
}
