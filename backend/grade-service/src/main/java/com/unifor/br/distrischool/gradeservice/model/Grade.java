package com.unifor.br.distrischool.gradeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades", uniqueConstraints = {
        @UniqueConstraint(name = "uq_grade_aluno_turma", columnNames = {"aluno_id", "turma_id"})
})
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O ID do aluno é obrigatório")
    @Column(name = "aluno_id", nullable = false)
    private Long alunoId;

    @NotNull(message = "O ID/código da turma é obrigatório")
    @Column(name = "turma_id", nullable = false)
    private String turmaId;

    @Column(name = "nota1")
    private Double nota1;

    @Column(name = "nota2")
    private Double nota2;

    @Column(name = "nota_final")
    private Double notaFinal;

    @Column(name = "media_calculada")
    private Double mediaCalculada;

    @Column(nullable = false)
    private String situacao = "EM_ANDAMENTO";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
        calcularMediaESituacao();
    }

    public void calcularMediaESituacao() {
        if (nota1 != null && nota2 != null) {
            double media = (nota1 + nota2) / 2.0;
            if (notaFinal != null) {
                // Se fez prova final, calcula média ponderada ou composta
                media = (media + notaFinal) / 2.0;
            }
            this.mediaCalculada = Math.round(media * 100.0) / 100.0;

            if (this.mediaCalculada >= 7.0) {
                this.situacao = "APROVADO";
            } else if (this.mediaCalculada >= 4.0 && notaFinal == null) {
                this.situacao = "RECUPERACAO";
            } else if (this.mediaCalculada >= 5.0 && notaFinal != null) {
                this.situacao = "APROVADO_FINAL";
            } else {
                this.situacao = "REPROVADO";
            }
        } else {
            this.mediaCalculada = null;
            this.situacao = "EM_ANDAMENTO";
        }
    }

    public Grade() {
    }

    public Grade(Long alunoId, String turmaId, Double nota1, Double nota2, Double notaFinal) {
        this.alunoId = alunoId;
        this.turmaId = turmaId;
        this.nota1 = nota1;
        this.nota2 = nota2;
        this.notaFinal = notaFinal;
        calcularMediaESituacao();
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

    public String getTurmaId() {
        return turmaId;
    }

    public void setTurmaId(String turmaId) {
        this.turmaId = turmaId;
    }

    public Double getNota1() {
        return nota1;
    }

    public void setNota1(Double nota1) {
        this.nota1 = nota1;
    }

    public Double getNota2() {
        return nota2;
    }

    public void setNota2(Double nota2) {
        this.nota2 = nota2;
    }

    public Double getNotaFinal() {
        return notaFinal;
    }

    public void setNotaFinal(Double notaFinal) {
        this.notaFinal = notaFinal;
    }

    public Double getMediaCalculada() {
        return mediaCalculada;
    }

    public void setMediaCalculada(Double mediaCalculada) {
        this.mediaCalculada = mediaCalculada;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
