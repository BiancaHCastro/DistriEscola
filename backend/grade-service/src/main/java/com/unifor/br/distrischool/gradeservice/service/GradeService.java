package com.unifor.br.distrischool.gradeservice.service;

import com.unifor.br.distrischool.gradeservice.dto.GradeRequestDTO;
import com.unifor.br.distrischool.gradeservice.model.Grade;
import com.unifor.br.distrischool.gradeservice.repository.GradeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GradeService {

    private static final Logger log = LoggerFactory.getLogger(GradeService.class);

    private final GradeRepository repository;
    private final AmqpTemplate amqpTemplate;

    @Value("${distrischool.rabbitmq.exchange:distrischool.events}")
    private String exchangeName;

    @Value("${distrischool.rabbitmq.grade-routing-key:grade.posted}")
    private String routingKey;

    public GradeService(GradeRepository repository, AmqpTemplate amqpTemplate) {
        this.repository = repository;
        this.amqpTemplate = amqpTemplate;
    }

    @Transactional
    public Grade lancarNotas(GradeRequestDTO dto) {
        Grade grade = repository.findByAlunoIdAndTurmaId(dto.getAlunoId(), dto.getTurmaId())
                .orElse(new Grade());

        grade.setAlunoId(dto.getAlunoId());
        grade.setTurmaId(dto.getTurmaId());
        if (dto.getNota1() != null) grade.setNota1(dto.getNota1());
        if (dto.getNota2() != null) grade.setNota2(dto.getNota2());
        if (dto.getNotaFinal() != null) grade.setNotaFinal(dto.getNotaFinal());

        grade.calcularMediaESituacao();
        Grade salvo = repository.save(grade);

        // Publicação de evento no RabbitMQ
        try {
            log.info("Publicando evento grade.posted no RabbitMQ para aluno {} na turma {}: Média {}",
                    salvo.getAlunoId(), salvo.getTurmaId(), salvo.getMediaCalculada());
            amqpTemplate.convertAndSend(exchangeName, routingKey, salvo);
        } catch (Exception e) {
            log.warn("Aviso: Falha ao emitir evento no RabbitMQ ({}). Registro de notas salvo com resiliência.", e.getMessage());
        }

        return salvo;
    }

    @Transactional(readOnly = true)
    public List<Grade> listarPorTurma(String turmaId) {
        return repository.findByTurmaId(turmaId);
    }

    @Transactional(readOnly = true)
    public List<Grade> listarPorAluno(Long alunoId) {
        return repository.findByAlunoId(alunoId);
    }

    @Transactional(readOnly = true)
    public Optional<Grade> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Grade> listarTodas() {
        return repository.findAll();
    }
}
