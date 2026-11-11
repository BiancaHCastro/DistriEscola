package com.unifor.br.distrischool.attendance_service.service;

import com.unifor.br.distrischool.attendance_service.dto.AttendanceRequestDTO;
import com.unifor.br.distrischool.attendance_service.model.Attendance;
import com.unifor.br.distrischool.attendance_service.model.AttendanceStatus;
import com.unifor.br.distrischool.attendance_service.repository.AttendanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository repository;
    private final AmqpTemplate amqpTemplate;

    @Value("${distrischool.rabbitmq.exchange:distrischool.events}")
    private String exchangeName;

    @Value("${distrischool.rabbitmq.attendance-routing-key:attendance.recorded}")
    private String routingKey;

    public AttendanceService(AttendanceRepository repository, AmqpTemplate amqpTemplate) {
        this.repository = repository;
        this.amqpTemplate = amqpTemplate;
    }

    @Transactional
    public Attendance registrarChamada(AttendanceRequestDTO dto) {
        Attendance attendance = new Attendance(
                dto.getAlunoId(),
                dto.getTurmaId(),
                dto.getData() != null ? dto.getData() : LocalDate.now(),
                dto.getStatus()
        );
        Attendance saved = repository.save(attendance);

        // Publicação Assíncrona no RabbitMQ desacoplada
        try {
            log.info("Publicando evento attendance.recorded no RabbitMQ para aluno {} na turma {}", saved.getAlunoId(), saved.getTurmaId());
            amqpTemplate.convertAndSend(exchangeName, routingKey, saved);
        } catch (Exception e) {
            log.warn("Aviso: Falha ao emitir evento no RabbitMQ ({}). Registro persistido no banco com resiliência.", e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Attendance> listarPorTurmaEData(String turmaId, LocalDate data) {
        if (turmaId != null && data != null) {
            return repository.findByTurmaIdAndData(turmaId, data);
        } else if (turmaId != null) {
            return repository.findAll().stream().filter(a -> a.getTurmaId().equals(turmaId)).toList();
        }
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> consultarRelatorio(Long alunoId, String turmaId) {
        List<Attendance> attendances;
        if (alunoId != null && turmaId != null) {
            attendances = repository.findByAlunoIdAndTurmaId(alunoId, turmaId);
        } else if (alunoId != null) {
            attendances = repository.findByAlunoId(alunoId);
        } else if (turmaId != null) {
            attendances = repository.findAll().stream().filter(a -> a.getTurmaId().equals(turmaId)).toList();
        } else {
            attendances = repository.findAll();
        }

        long total = attendances.size();
        long presencas = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENCA || a.getStatus() == AttendanceStatus.ATRASO).count();
        long faltas = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.FALTA).count();
        double percentualPresenca = total > 0 ? ((double) presencas / total) * 100 : 100.0;

        Map<String, Object> report = new HashMap<>();
        report.put("totalAulas", total);
        report.put("presencas", presencas);
        report.put("faltas", faltas);
        report.put("percentualPresenca", percentualPresenca);
        report.put("historico", attendances);
        return report;
    }
}
