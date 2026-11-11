package com.unifor.br.distrischool.classservice.client;

import com.unifor.br.distrischool.classservice.dto.TeacherDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TeacherClient {

    private static final Logger log = LoggerFactory.getLogger(TeacherClient.class);

    private final RestTemplate restTemplate;
    private final String teacherServiceUrl;

    public TeacherClient(
            RestTemplate restTemplate,
            @Value("${services.teacher.url:http://teacher-service:8083}") String teacherServiceUrl) {
        this.restTemplate = restTemplate;
        this.teacherServiceUrl = teacherServiceUrl;
    }

    /**
     * Busca dados do professor via REST síncrono.
     * Caso o teacher-service esteja indisponível, ativa Fallback de Resiliência (Circuit Breaker ready).
     */
    public TeacherDTO findTeacherById(Long teacherId) {
        if (teacherId == null) {
            return null;
        }

        try {
            String url = teacherServiceUrl + "/api/teachers/" + teacherId;
            log.info("Chamando teacher-service via REST: {}", url);
            ResponseEntity<TeacherDTO> response = restTemplate.getForEntity(url, TeacherDTO.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("teacher-service indisponível ({}) para teacherId {}. Ativando Fallback de Resiliência.", e.getMessage(), teacherId);
        }

        return TeacherDTO.fallback(teacherId);
    }
}
