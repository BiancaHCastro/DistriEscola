package com.unifor.br.distrischool.teacherservice.repository;

import com.unifor.br.distrischool.teacherservice.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByMatricula(String matricula);

    Optional<Teacher> findByEmail(String email);

    boolean existsByMatricula(String matricula);

    boolean existsByEmail(String email);
}
