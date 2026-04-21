package com.accenture.sad_tool.template;

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
class SadTemplateServiceTest {

    @Mock
    private SadTemplateRepository repository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SadTemplateService templateService;

    private UUID templateId;
    private AppUser user;
    private SadTemplate template;

    @BeforeEach
    void setUp() {
        templateId = UUID.randomUUID();

        user = new AppUser();
        user.setUsername("admin");

        template = new SadTemplate();
        template.setTitle("My Template");
        template.setHtmlContent("<p>Content</p>");
        template.setCreatedBy(user);
    }

    private SadTemplate withTimestamps(SadTemplate t) {
        try {
            var createdAt = SadTemplate.class.getDeclaredField("createdAt");
            var updatedAt = SadTemplate.class.getDeclaredField("updatedAt");
            createdAt.setAccessible(true);
            updatedAt.setAccessible(true);
            createdAt.set(t, LocalDateTime.now());
            updatedAt.set(t, LocalDateTime.now());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return t;
    }

    @Test
    void getAllTemplates_returnsOnlyActive() {
        SadTemplate deleted = new SadTemplate();
        deleted.setTitle("Deleted");
        deleted.setHtmlContent("<p></p>");
        deleted.setDeletedAt(LocalDateTime.now());

        when(repository.findAllByDeletedAtIsNull()).thenReturn(List.of(withTimestamps(template)));

        List<TemplateDto.Response> result = templateService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("My Template");
    }

    @Test
    void createTemplate_success() {
        TemplateDto.Request request = new TemplateDto.Request();
        request.setTitle("My Template");
        request.setHtmlContent("<p>Content</p>");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(repository.save(any(SadTemplate.class))).thenReturn(withTimestamps(template));

        TemplateDto.Response response = templateService.create(request, "admin");

        assertThat(response.getTitle()).isEqualTo("My Template");
        assertThat(response.getCreatedByUsername()).isEqualTo("admin");
        verify(repository).save(any(SadTemplate.class));
    }

    @Test
    void softDelete_success() {
        when(repository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.of(withTimestamps(template)));

        templateService.softDelete(templateId);

        assertThat(template.getDeletedAt()).isNotNull();
        verify(repository).save(template);
    }

    @Test
    void softDelete_notFound() {
        when(repository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> templateService.softDelete(templateId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Template not found");
    }

    @Test
    void getById_archived_returnsNotFound() {
        when(repository.findByIdAndDeletedAtIsNull(templateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> templateService.getById(templateId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Template not found");
    }
}
