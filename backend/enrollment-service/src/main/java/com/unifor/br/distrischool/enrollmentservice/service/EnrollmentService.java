package com.unifor.br.distrischool.enrollmentservice.service;

import com.unifor.br.distrischool.enrollmentservice.client.AlunoClient;
import com.unifor.br.distrischool.enrollmentservice.client.ClassClient;
import com.unifor.br.distrischool.enrollmentservice.dto.AlunoDTO;
import com.unifor.br.distrischool.enrollmentservice.dto.ClassDTO;
import com.unifor.br.distrischool.enrollmentservice.dto.EnrollmentResponseDTO;
import com.unifor.br.distrischool.enrollmentservice.model.Enrollment;
import com.unifor.br.distrischool.enrollmentservice.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository repository;
    private final AlunoClient alunoClient;
    private final ClassClient classClient;

    public EnrollmentService(
            EnrollmentRepository repository,
            AlunoClient alunoClient,
            ClassClient classClient) {
        this.repository = repository;
        this.alunoClient = alunoClient;
        this.classClient = classClient;
    }

    /**
     * Realiza a matrícula do aluno na turma/disciplina (Regra N:N).
     * Valida de forma síncrona REST com fallbacks resilientes.
     */
    @Transactional
    public Enrollment matricular(Long alunoId, Long classId) {
        if (repository.existsByAlunoIdAndClassId(alunoId, classId)) {
            throw new IllegalArgumentException("O aluno já está matriculado nesta turma/disciplina.");
        }

        // Validação REST com Fallback para aluno-service
        AlunoDTO aluno = alunoClient.findAlunoById(alunoId);
        if (aluno == null) {
            throw new IllegalArgumentException("Aluno não encontrado para o ID: " + alunoId);
        }

        // Validação REST com Fallback para class-service
        ClassDTO turma = classClient.findClassById(classId);
        if (turma == null) {
            throw new IllegalArgumentException("Turma/Disciplina não encontrada para o ID: " + classId);
        }

        // Validação de capacidade da turma
        long matriculasAtivas = repository.countByClassIdAndStatus(classId, "ATIVA");
        if (turma.getCapacidadeMaxima() != null && matriculasAtivas >= turma.getCapacidadeMaxima()) {
            throw new IllegalArgumentException("A turma atingiu a capacidade máxima (" + turma.getCapacidadeMaxima() + " vagas).");
        }

        Enrollment enrollment = new Enrollment(alunoId, classId);
        return repository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> listarPorAluno(Long alunoId) {
        return repository.findByAlunoId(alunoId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> listarPorTurma(Long classId) {
        return repository.findByClassId(classId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<EnrollmentResponseDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::toResponseDTO);
    }

    @Transactional
    public void cancelarMatricula(Long id) {
        repository.deleteById(id);
    }

    private EnrollmentResponseDTO toResponseDTO(Enrollment entity) {
        AlunoDTO aluno = alunoClient.findAlunoById(entity.getAlunoId());
        ClassDTO turma = classClient.findClassById(entity.getClassId());
        return new EnrollmentResponseDTO(entity, aluno, turma);
    }
}
