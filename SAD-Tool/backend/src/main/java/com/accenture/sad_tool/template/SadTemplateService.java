package com.accenture.sad_tool.template;

import com.accenture.sad_tool.user.AppUser;
import com.accenture.sad_tool.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
public class SadTemplateService {

    private final SadTemplateRepository repository;
    private final UserRepository userRepository;

    public SadTemplateService(SadTemplateRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<TemplateDto.Response> getAll() {
        return repository.findAllByDeletedAtIsNull()
            .stream()
            .map(TemplateDto.Response::from)
            .toList();
    }

    public TemplateDto.Response getById(UUID id) {
        SadTemplate template = findActiveOrThrow(id);
        return TemplateDto.Response.from(template);
    }

    public TemplateDto.Response create(TemplateDto.Request request, String username) {
        AppUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        SadTemplate template = new SadTemplate();
        template.setTitle(request.getTitle());
        template.setHtmlContent(sanitize(request.getHtmlContent()));
        template.setCreatedBy(user);
        return TemplateDto.Response.from(repository.save(template));
    }

    public TemplateDto.Response update(UUID id, TemplateDto.Request request) {
        SadTemplate template = findActiveOrThrow(id);
        template.setTitle(request.getTitle());
        template.setHtmlContent(sanitize(request.getHtmlContent()));
        return TemplateDto.Response.from(repository.save(template));
    }

    public void softDelete(UUID id) {
        SadTemplate template = findActiveOrThrow(id);
        template.setDeletedAt(LocalDateTime.now());
        repository.save(template);
    }

    private String sanitize(String html) {
        return Jsoup.clean(html, Safelist.relaxed()
            .addTags("h1", "h2", "h3", "h4", "h5", "h6")
            .addAttributes(":all", "style"));
    }

    private SadTemplate findActiveOrThrow(UUID id) {
        return repository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Template not found: " + id
            ));
    }
}
