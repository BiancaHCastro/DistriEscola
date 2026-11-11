package com.unifor.br.distrischool.classservice.dto;

import com.unifor.br.distrischool.classservice.model.ClassEntity;

public class ClassDTO {

    private Long id;
    private String codigo;
    private String nomeDisciplina;
    private String semestre;
    private String horario;
    private String sala;
    private Integer capacidadeMaxima;
    private Long teacherId;
    private TeacherDTO teacher;

    public ClassDTO() {
    }

    public ClassDTO(ClassEntity entity, TeacherDTO teacher) {
        this.id = entity.getId();
        this.codigo = entity.getCodigo();
        this.nomeDisciplina = entity.getNomeDisciplina();
        this.semestre = entity.getSemestre();
        this.horario = entity.getHorario();
        this.sala = entity.getSala();
        this.capacidadeMaxima = entity.getCapacidadeMaxima();
        this.teacherId = entity.getTeacherId();
        this.teacher = teacher;
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

    public TeacherDTO getTeacher() {
        return teacher;
    }

    public void setTeacher(TeacherDTO teacher) {
        this.teacher = teacher;
    }
}
