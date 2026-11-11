package com.unifor.br.distrischool.enrollmentservice.client;

import com.unifor.br.distrischool.enrollmentservice.dto.ClassDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ClassClient {

    private static final Logger log = LoggerFactory.getLogger(ClassClient.class);

    private final RestTemplate restTemplate;
    private final String classServiceUrl;

    public ClassClient(
            RestTemplate restTemplate,
            @Value("${services.class.url:http://class-service:8085}") String classServiceUrl) {
        this.restTemplate = restTemplate;
        this.classServiceUrl = classServiceUrl;
    }

    /**
     * Validação e busca síncrona REST de turma com Fallback para Circuit Breaker.
     */
    public ClassDTO findClassById(Long classId) {
        if (classId == null) {
            return null;
        }

        try {
            String url = classServiceUrl + "/api/classes/" + classId;
            log.info("Validando turma via class-service: {}", url);
            ResponseEntity<ClassDTO> response = restTemplate.getForEntity(url, ClassDTO.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("class-service indisponível ({}) para classId {}. Utilizando Fallback de Resiliência.", e.getMessage(), classId);
        }

        return ClassDTO.fallback(classId);
    }
}
