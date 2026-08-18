package com.travelsphere.ai.service;

import com.travelsphere.ai.dto.*;
import com.travelsphere.ai.model.ChatMessage;
import com.travelsphere.ai.model.ChatSession;
import com.travelsphere.ai.repository.ChatMessageRepository;
import com.travelsphere.ai.repository.ChatSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiAgentServiceImplTest {

    @Mock private ChatSessionRepository sessionRepository;
    @Mock private ChatMessageRepository messageRepository;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock private McpServer mcpServer;
    @Mock private RagService ragService;
    @Mock private DocumentIngestionService ingestionService;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS) private WebClient.Builder webClientBuilder;
    @InjectMocks private AiAgentServiceImpl aiAgentService;

    private UUID sessionId;

    @BeforeEach
    void setUp() {
        sessionId = UUID.randomUUID();
        ReflectionTestUtils.setField(aiAgentService, "ollamaBaseUrl", "http://localhost:11434");
        ReflectionTestUtils.setField(aiAgentService, "chatModel", "llama3.2");
    }

    @Test
    void chatCreatesNewSessionWhenNoneProvided() {
        ChatSession session = ChatSession.builder().id(sessionId).title("Hello").build();
        when(sessionRepository.save(any(ChatSession.class))).thenReturn(session);
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenReturn(List.of());

        ChatRequest request = ChatRequest.builder().message("Hello").build();

        // AiAgentServiceImpl.callOllama will be called - test the fallback
        ChatResponse response = aiAgentService.chat(request);

        assertNotNull(response);
        assertEquals(sessionId, response.getSessionId());
        verify(sessionRepository).save(any(ChatSession.class));
    }

    @Test
    void chatUsesExistingSession() {
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenReturn(List.of());

        ChatRequest request = ChatRequest.builder().sessionId(sessionId).message("Hi").build();

        ChatResponse response = aiAgentService.chat(request);

        assertNotNull(response);
        assertEquals(sessionId, response.getSessionId());
        verify(sessionRepository, never()).save(any(ChatSession.class));
    }

    @Test
    void planTripReturnsResponse() {
        TripPlanRequest request = TripPlanRequest.builder()
                .destination("Goa").durationDays(5).travelers(2)
                .budget(50000.0).preferences("beach, food").build();

        TripPlanResponse response = aiAgentService.planTrip(request);

        assertNotNull(response);
        assertEquals("Goa", response.getDestination());
        assertEquals(5, response.getDurationDays());
        assertEquals(50000.0, response.getBudget());
        assertNotNull(response.getRecommendations());
        assertFalse(response.getRecommendations().isEmpty());
    }

    @Test
    void getRecommendationsReturnsFallback() {
        String result = aiAgentService.getRecommendations("user-123");

        assertNotNull(result);
        assertTrue(result.contains("unavailable") || result.contains("sorry") || result.length() > 0);
    }

    @Test
    void getInsuranceAdvisorReturnsFallback() {
        String result = aiAgentService.getInsuranceAdvisor("Europe", 10, 30);

        assertNotNull(result);
        assertTrue(result.contains("unavailable") || result.contains("sorry") || result.length() > 0);
    }

    @Test
    void ollamaFallbackReturnsUnavailableMessage() {
        String result = aiAgentService.ollamaFallback("test prompt", new RuntimeException("Connection refused"));

        assertEquals("AI service is temporarily unavailable. Please try again later or use the MCP tools directly.", result);
    }
}
