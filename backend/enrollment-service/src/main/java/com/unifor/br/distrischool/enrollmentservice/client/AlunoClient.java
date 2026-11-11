package com.unifor.br.distrischool.enrollmentservice.client;

import com.unifor.br.distrischool.enrollmentservice.dto.AlunoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AlunoClient {

    private static final Logger log = LoggerFactory.getLogger(AlunoClient.class);

    private final RestTemplate restTemplate;
    private final String alunoServiceUrl;

    public AlunoClient(
            RestTemplate restTemplate,
            @Value("${services.aluno.url:http://aluno-service:8082}") String alunoServiceUrl) {
        this.restTemplate = restTemplate;
        this.alunoServiceUrl = alunoServiceUrl;
    }

    /**
     * Validação e busca síncrona REST de aluno com Fallback para Circuit Breaker.
     */
    public AlunoDTO findAlunoById(Long alunoId) {
        if (alunoId == null) {
            return null;
        }

        try {
            String url = alunoServiceUrl + "/api/students/" + alunoId;
            log.info("Validando aluno via aluno-service: {}", url);
            ResponseEntity<AlunoDTO> response = restTemplate.getForEntity(url, AlunoDTO.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("aluno-service indisponível ({}) para alunoId {}. Utilizando Fallback de Resiliência.", e.getMessage(), alunoId);
        }

        return AlunoDTO.fallback(alunoId);
    }
}
