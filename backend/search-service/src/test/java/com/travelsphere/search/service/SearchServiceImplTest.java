package com.travelsphere.search.service;

import com.travelsphere.search.dto.*;
import com.travelsphere.search.model.SearchIndex;
import com.travelsphere.search.repository.SearchIndexRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchServiceImplTest {

    @Mock private SearchIndexRepository searchIndexRepository;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private KafkaTemplate<String, Object> kafkaTemplate;
    @InjectMocks private SearchServiceImpl searchService;

    @BeforeEach
    void setUp() {
        // lenient: only the search tests read the Redis cache
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void searchReturnsResults() {
        SearchIndex index = SearchIndex.builder()
                .id(UUID.randomUUID()).entityType("HOTEL")
                .entityId(UUID.randomUUID()).title("Grand Hotel")
                .description("Luxury hotel in Mumbai").city("Mumbai").country("India")
                .category("LUXURY").rating(4.5).price(5000.0)
                .isActive(true).build();

        when(searchIndexRepository.searchWithFilters("hotel", "HOTEL", "Mumbai", null))
                .thenReturn(List.of(index));

        SearchQueryRequest request = SearchQueryRequest.builder()
                .query("hotel").entityType("HOTEL").city("Mumbai")
                .page(0).size(10).build();

        SearchResponse response = searchService.search(request);

        assertEquals(1, response.getTotal());
        assertEquals("Grand Hotel", response.getResults().get(0).getTitle());
    }

    @Test
    void searchReturnsEmptyList() {
        when(searchIndexRepository.searchWithFilters(any(), any(), any(), any()))
                .thenReturn(List.of());

        SearchQueryRequest request = SearchQueryRequest.builder()
                .query("xyz").page(0).size(10).build();

        SearchResponse response = searchService.search(request);

        assertEquals(0, response.getTotal());
        assertTrue(response.getResults().isEmpty());
    }

    @Test
    void indexDocumentSuccess() {
        when(searchIndexRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        IndexDocumentRequest request = IndexDocumentRequest.builder()
                .entityType("HOTEL").entityId(UUID.randomUUID())
                .title("Test Hotel").description("A test hotel")
                .city("Goa").country("India").category("BEACH")
                .rating(4.0).price(3000.0).build();

        assertDoesNotThrow(() -> searchService.indexDocument(request));
        verify(searchIndexRepository).save(any());
    }

    @Test
    void removeDocumentSetsInactive() {
        UUID entityId = UUID.randomUUID();
        SearchIndex index = SearchIndex.builder()
                .id(UUID.randomUUID()).entityType("HOTEL").entityId(entityId)
                .isActive(true).build();

        when(searchIndexRepository.findAll()).thenReturn(List.of(index));
        when(searchIndexRepository.save(any())).thenReturn(index);

        assertDoesNotThrow(() -> searchService.removeDocument("HOTEL", entityId.toString()));
        assertFalse(index.isActive());
    }
}
