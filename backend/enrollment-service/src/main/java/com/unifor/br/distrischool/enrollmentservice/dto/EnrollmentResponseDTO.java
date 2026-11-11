package com.unifor.br.distrischool.enrollmentservice.dto;

import com.unifor.br.distrischool.enrollmentservice.model.Enrollment;
import java.time.LocalDateTime;

public class EnrollmentResponseDTO {

    private Long id;
    private Long alunoId;
    private Long classId;
    private LocalDateTime dataMatricula;
    private String status;
    private AlunoDTO aluno;
    private ClassDTO turma;

    public EnrollmentResponseDTO() {
    }

    public EnrollmentResponseDTO(Enrollment entity, AlunoDTO aluno, ClassDTO turma) {
        this.id = entity.getId();
        this.alunoId = entity.getAlunoId();
        this.classId = entity.getClassId();
        this.dataMatricula = entity.getDataMatricula();
        this.status = entity.getStatus();
        this.aluno = aluno;
        this.turma = turma;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public LocalDateTime getDataMatricula() {
        return dataMatricula;
    }

    public void setDataMatricula(LocalDateTime dataMatricula) {
        this.dataMatricula = dataMatricula;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public AlunoDTO getAluno() {
        return aluno;
    }

    public void setAluno(AlunoDTO aluno) {
        this.aluno = aluno;
    }

    public ClassDTO getTurma() {
        return turma;
    }

    public void setTurma(ClassDTO turma) {
        this.turma = turma;
    }
}
