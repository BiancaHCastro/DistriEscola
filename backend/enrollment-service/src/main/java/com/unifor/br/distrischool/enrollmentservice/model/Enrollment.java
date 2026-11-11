package com.unifor.br.distrischool.enrollmentservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(name = "uq_aluno_class", columnNames = {"aluno_id", "class_id"})
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O ID do aluno é obrigatório")
    @Column(name = "aluno_id", nullable = false)
    private Long alunoId;

    @NotNull(message = "O ID da turma é obrigatório")
    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "data_matricula", updatable = false)
    private LocalDateTime dataMatricula;

    @Column(nullable = false)
    private String status = "ATIVA";

    @PrePersist
    protected void onCreate() {
        this.dataMatricula = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ATIVA";
        }
    }

    public Enrollment() {
    }

    public Enrollment(Long alunoId, Long classId) {
        this.alunoId = alunoId;
        this.classId = classId;
        this.status = "ATIVA";
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
}
