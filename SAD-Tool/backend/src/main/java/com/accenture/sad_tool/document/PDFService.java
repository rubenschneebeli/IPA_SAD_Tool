package com.accenture.sad_tool.document;

import com.lowagie.text.DocumentException;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class PDFService {

    private final DocumentRepository documentRepository;

    public PDFService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public byte[] generatePDF(UUID documentId) {
        SadDocument document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Document not found: " + documentId
            ));

        String safeHtml = sanitizeAndInsert(document.getTitle(), document.getHtmlContent());

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(safeHtml);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Error while generating PDF"
            );
        }
    }

    private String sanitizeAndInsert(String title, String htmlContent) {
        Safelist safelist = Safelist.relaxed()
            .addTags("h1", "h2", "h3", "h4", "h5", "h6")
            .addAttributes(":all", "style");

        String cleanHtml = Jsoup.clean(htmlContent, safelist);

        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>%s</title>
                <style>
                    @page {
                        @bottom-right {
                            content: "Page " counter(page);
                            font-size: 10pt;
                        }
                    }
                    body { font-family: Arial, sans-serif; margin: 40px; font-size: 12pt; }
                    h1 { font-size: 20pt; margin-bottom: 10px; }
                    h2 { font-size: 16pt; margin-top: 20px; page-break-before: always; }
                    h3 { font-size: 13pt; margin-top: 15px; }
                    p { line-height: 1.5; }
                    .cover {
                        page-break-after: always;
                        text-align: center;
                        margin-top: 300px;
                    }
                </style>
            </head>
            <body>
                <div class="cover">
                    <h1>%s</h1>
                </div>
                %s
            </body>
            </html>
            """.formatted(title, title, cleanHtml);
    }
}
