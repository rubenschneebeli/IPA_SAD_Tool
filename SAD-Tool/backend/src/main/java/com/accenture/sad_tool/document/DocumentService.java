package com.accenture.sad_tool.document;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.accenture.sad_tool.template.SadTemplate;
import com.accenture.sad_tool.template.SadTemplateRepository;
import com.accenture.sad_tool.user.AppUser;
import com.accenture.sad_tool.user.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final SadTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public DocumentService(DocumentRepository documentRepository, SadTemplateRepository templateRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    public List<DocumentDto.Response> getAll() { 
        return documentRepository.findAll()
            .stream()
            .map(DocumentDto.Response::from)
            .toList();
    }

    public DocumentDto.Response getById(UUID id) {
        return DocumentDto.Response.from(findOrError(id));
    }

    public DocumentDto.Response create(DocumentDto.CreateRequest request, String username) {
        SadTemplate template = templateRepository.findByIdAndDeletedAtIsNull(request.getTemplateId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Teplate not found: " + request.getTemplateId()
            ));

        AppUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        SadDocument document = new SadDocument();
        document.setTitle(request.getTitle());
        document.setHtmlContent(template.getHtmlContent());
        document.setTemplate(template);
        document.setCreatedBy(user);

        return DocumentDto.Response.from(documentRepository.save(document));
    }

    public DocumentDto.Response update(UUID id, DocumentDto.UpdateRequest request) {
        SadDocument document = findOrError(id);
        document.setTitle(request.getTitle());
        document.setHtmlContent(sanitize(request.getHtmlContent()));
        return DocumentDto.Response.from(documentRepository.save(document));
    }

    private String sanitize(String html) {
        return Jsoup.clean(html, Safelist.relaxed()
            .addTags("h1", "h2", "h3", "h4", "h5", "h6")
            .addAttributes(":all", "style"));
    }

    public void delete(UUID id) {
        SadDocument document = findOrError(id);
        documentRepository.delete(document);
    }

    private SadDocument findOrError(UUID id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Document not found: " + id
            ));
    }
}
