package com.unifor.br.distrischool.classservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "classes")
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O código da turma/disciplina é obrigatório")
    @Column(unique = true, nullable = false)
    private String codigo;

    @NotBlank(message = "O nome da disciplina é obrigatório")
    @Column(name = "nome_disciplina", nullable = false)
    private String nomeDisciplina;

    @NotBlank(message = "O semestre letivo é obrigatório")
    @Column(nullable = false)
    private String semestre;

    private String horario;

    private String sala;

    @Column(name = "capacidade_maxima", nullable = false)
    private Integer capacidadeMaxima = 40;

    @Column(name = "teacher_id")
    private Long teacherId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.capacidadeMaxima == null) {
            this.capacidadeMaxima = 40;
        }
    }

    public ClassEntity() {
    }

    public ClassEntity(String codigo, String nomeDisciplina, String semestre, String horario, String sala, Integer capacidadeMaxima, Long teacherId) {
        this.codigo = codigo;
        this.nomeDisciplina = nomeDisciplina;
        this.semestre = semestre;
        this.horario = horario;
        this.sala = sala;
        this.capacidadeMaxima = capacidadeMaxima;
        this.teacherId = teacherId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNomeDisciplina() {
        return nomeDisciplina;
    }

    public void setNomeDisciplina(String nomeDisciplina) {
        this.nomeDisciplina = nomeDisciplina;
    }

    public String getSemestre() {
        return semestre;
    }

    public void setSemestre(String semestre) {
        this.semestre = semestre;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getSala() {
        return sala;
    }

    public void setSala(String sala) {
        this.sala = sala;
    }

    public Integer getCapacidadeMaxima() {
        return capacidadeMaxima;
    }

    public void setCapacidadeMaxima(Integer capacidadeMaxima) {
        this.capacidadeMaxima = capacidadeMaxima;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
