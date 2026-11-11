package com.unifor.br.distrischool.enrollmentservice.repository;

import com.unifor.br.distrischool.enrollmentservice.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByAlunoId(Long alunoId);

    List<Enrollment> findByClassId(Long classId);

    boolean existsByAlunoIdAndClassId(Long alunoId, Long classId);

    long countByClassIdAndStatus(Long classId, String status);
}
