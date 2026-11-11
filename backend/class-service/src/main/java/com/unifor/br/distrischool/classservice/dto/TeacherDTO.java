package com.unifor.br.distrischool.classservice.dto;

public class TeacherDTO {

    private Long id;
    private String matricula;
    private String nome;
    private String email;
    private String especialidade;
    private boolean fallback = false;

    public TeacherDTO() {
    }

    public TeacherDTO(Long id, String matricula, String nome, String email, String especialidade, boolean fallback) {
        this.id = id;
        this.matricula = matricula;
        this.nome = nome;
        this.email = email;
        this.especialidade = especialidade;
        this.fallback = fallback;
    }

    public static TeacherDTO fallback(Long teacherId) {
        return new TeacherDTO(
                teacherId,
                "PROF-FALLBACK",
                "Professor Indisponível (Modo Resiliência)",
                "suporte@distrischool.edu.br",
                "Especialidade Não Carregada",
                true
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
