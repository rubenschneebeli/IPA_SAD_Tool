package com.accenture.sad_tool.document;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Tag(name = "Documents", description = "Document management")
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService service;
    private final PDFService pdfService;

    public DocumentController(DocumentService service, PDFService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @Operation(summary = "GET all documents")
    @GetMapping
    public List<DocumentDto.Response> getAll() {
        return service.getAll();
    }

    @Operation(summary = "GET document by id")
    @GetMapping("/{id}")
    public DocumentDto.Response getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "CREATE new document based on template")
    @PostMapping
    public ResponseEntity<DocumentDto.Response> create(@Valid @RequestBody DocumentDto.CreateRequest request,
    Principal principal) {
        var response = service.create(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "UPDATE document content")
    @PutMapping("/{id}")
    public DocumentDto.Response update(@PathVariable UUID id, @Valid @RequestBody DocumentDto.UpdateRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "DELETE document by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);

        return ResponseEntity.noContent().build();
    }


    
    @Operation(summary = "Export document as PDF")
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        DocumentDto.Response document = service.getById(id);
        byte[] pdfBytes = pdfService.generatePDF(id);

        String filename = document.getTitle().replaceAll("[^a-zA-Z0-9-_]", "_") + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
