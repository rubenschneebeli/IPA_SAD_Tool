package com.accenture.sad_tool.template;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;


@Tag(name = "Templates", description = "Template management")
@RestController
@RequestMapping("/api/templates")
public class SadTemplateController {

    private final SadTemplateService service;

    public SadTemplateController(SadTemplateService service) {
        this.service = service;
    }

    @Operation(summary = "GET all active templates")
    @GetMapping
    public List<TemplateDto.Response> getAll() {
        return service.getAll();
    }

    @Operation(summary = "GET a template by id")
    @GetMapping("/{id}")
    public TemplateDto.Response getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "CREATE new template")
    @PostMapping
    public ResponseEntity<TemplateDto.Response> create(@Valid @RequestBody TemplateDto.Request request,
                                                        Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(request, principal.getName()));
    }

    @Operation(summary = "UPDATE template by id")
    @PutMapping("/{id}")
    public TemplateDto.Response update(@PathVariable UUID id, @Valid @RequestBody TemplateDto.Request request) {
        return service.update(id, request);
    }

    @Operation(summary = "DELETE template by id (soft delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
