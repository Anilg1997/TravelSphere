package com.travelsphere.document.service;

import com.travelsphere.common.feign.*;
import com.travelsphere.document.dto.*;
import com.travelsphere.document.model.Document;
import com.travelsphere.document.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock private FlightClient flightClient;
    @Mock private HotelClient hotelClient;
    @Mock private TransportClient transportClient;
    @Mock private CarRentalClient carRentalClient;
    @Mock private PackageClient packageClient;
    @Mock private InsuranceClient insuranceClient;

    @InjectMocks private DocumentServiceImpl documentService;

    private UUID documentId;
    private Document document;

    @BeforeEach
    void setUp() {
        documentId = UUID.randomUUID();
        document = Document.builder()
                .id(documentId).documentType(Document.DocumentType.BOOKING_CONFIRMATION)
                .fileName("TS-FL-123_BOOKING_CONFIRMATION.pdf")
                .s3Key("documents/TS-FL-123/TS-FL-123_BOOKING_CONFIRMATION.pdf")
                .contentType("application/pdf").fileSize(0L)
                .bookingRef("TS-FL-123").createdAt(LocalDateTime.now()).build();
    }

    @Test
    void generateDocumentSuccess() {
        when(documentRepository.save(any())).thenAnswer(inv -> {
            Document d = inv.getArgument(0);
            d.setId(documentId);
            return d;
        });

        GenerateDocumentRequest request = GenerateDocumentRequest.builder()
                .bookingRef("TS-FL-123").documentType("BOOKING_CONFIRMATION").build();

        DocumentResponse response = documentService.generateDocument(request, UUID.randomUUID().toString());

        assertNotNull(response);
        assertEquals("BOOKING_CONFIRMATION", response.getDocumentType());
        assertEquals("TS-FL-123", response.getBookingRef());
        assertTrue(response.getFileName().endsWith(".pdf"));
        verify(kafkaTemplate).send(eq("ts.documents.generated"), anyString(), any());
    }

    @Test
    void getDocumentSuccess() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        DocumentResponse response = documentService.getDocument(documentId);

        assertEquals("BOOKING_CONFIRMATION", response.getDocumentType());
        assertEquals(document.getS3Key(), response.getS3Key());
    }

    @Test
    void getDocumentNotFoundThrows() {
        when(documentRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> documentService.getDocument(documentId));
    }

    @Test
    void getUserDocumentsReturnsList() {
        when(documentRepository.findByUserIdOrderByCreatedAtDesc(any())).thenReturn(List.of(document));

        List<DocumentResponse> responses = documentService.getUserDocuments("a1b2c3d4-0000-4000-8000-000000000001");

        assertEquals(1, responses.size());
        assertEquals("BOOKING_CONFIRMATION", responses.get(0).getDocumentType());
    }

    @Test
    void downloadDocumentReturnsEmptyBytes() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        byte[] bytes = documentService.downloadDocument(documentId);

        assertNotNull(bytes);
    }
}
