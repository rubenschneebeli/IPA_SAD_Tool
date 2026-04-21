package com.accenture.sad_tool.document;

import com.accenture.sad_tool.template.SadTemplate;
import com.accenture.sad_tool.template.SadTemplateRepository;
import com.accenture.sad_tool.user.AppUser;
import com.accenture.sad_tool.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private SadTemplateRepository templateRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DocumentService documentService;

    private UUID documentId;
    private UUID templateId;
    private AppUser user;
    private SadTemplate template;
    private SadDocument document;

    @BeforeEach
    void setUp() {
        documentId = UUID.randomUUID();
        templateId = UUID.randomUUID();

        user = new AppUser();
        user.setUsername("admin");

        template = new SadTemplate();
        template.setTitle("Test Template");
        template.setHtmlContent("<p>Template content</p>");

        document = new SadDocument();
        document.setTitle("Test Document");
        document.setHtmlContent("<p>Content</p>");
        document.setTemplate(template);
        document.setCreatedBy(user);
    }

    private SadDocument withTimestamps(SadDocument doc) {
        try {
            var createdAt = SadDocument.class.getDeclaredField("createdAt");
            var updatedAt = SadDocument.class.getDeclaredField("updatedAt");
            createdAt.setAccessible(true);
            updatedAt.setAccessible(true);
            createdAt.set(doc, LocalDateTime.now());
            updatedAt.set(doc, LocalDateTime.now());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return doc;
    }

    @Test
    void createDocument_success() {
        DocumentDto.CreateRequest request = new DocumentDto.CreateRequest();
        request.setTitle("Test Document");
        request.setTemplateId(templateId);

        when(templateRepository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.of(template));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        
        when(documentRepository.save(any(SadDocument.class))).thenReturn(withTimestamps(document));

        DocumentDto.Response response = documentService.create(request, "admin");

        assertThat(response.getTitle()).isEqualTo("Test Document");
        assertThat(response.getTemplateTitle()).isEqualTo("Test Template");
        verify(documentRepository).save(any(SadDocument.class));
    }

    @Test
    void createDocument_userNotFound() {
        DocumentDto.CreateRequest request = new DocumentDto.CreateRequest();
        request.setTitle("Test Document");
        request.setTemplateId(templateId);

        when(templateRepository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.of(template));
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.create(request, "unknown"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void createDocument_templateNotFound() {
        DocumentDto.CreateRequest request = new DocumentDto.CreateRequest();
        request.setTitle("Test Document");
        request.setTemplateId(templateId);

        when(templateRepository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.create(request, "admin"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("template not found");
    }

    @Test
    void getDocumentById_success() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(withTimestamps(document)));

        DocumentDto.Response response = documentService.getById(documentId);

        assertThat(response.getTitle()).isEqualTo("Test Document");
    }

    @Test
    void getDocumentById_notFound() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getById(documentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Document not found");
    }

    @Test
    void getAllDocuments_returnsList() {
        when(documentRepository.findAll()).thenReturn(List.of(withTimestamps(document)));

        List<DocumentDto.Response> result = documentService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Document");
    }

    @Test
    void updateDocument_success() {
        DocumentDto.UpdateRequest request = new DocumentDto.UpdateRequest();
        request.setTitle("Updated Title");
        request.setHtmlContent("<p>Updated</p>");

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(withTimestamps(document)));
        when(documentRepository.save(any(SadDocument.class))).thenReturn(withTimestamps(document));

        DocumentDto.Response response = documentService.update(documentId, request);

        assertThat(response).isNotNull();
        verify(documentRepository).save(any(SadDocument.class));
    }

    @Test
    void updateDocument_notFound() {
        DocumentDto.UpdateRequest request = new DocumentDto.UpdateRequest();
        request.setTitle("Updated Title");
        request.setHtmlContent("<p>Updated</p>");

        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.update(documentId, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Document not found");
    }
}
