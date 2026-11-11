package com.unifor.br.distrischool.gradeservice.repository;

import com.unifor.br.distrischool.gradeservice.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByTurmaId(String turmaId);

    List<Grade> findByAlunoId(Long alunoId);

    Optional<Grade> findByAlunoIdAndTurmaId(Long alunoId, String turmaId);
}
