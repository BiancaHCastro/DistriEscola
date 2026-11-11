package com.unifor.br.distrischool.alunoservice.repository;

import com.unifor.br.distrischool.alunoservice.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    Optional<Aluno> findByMatricula(String matricula);

    boolean existsByMatricula(String matricula);
}