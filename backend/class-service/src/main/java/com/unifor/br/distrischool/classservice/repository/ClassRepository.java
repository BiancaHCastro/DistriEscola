package com.unifor.br.distrischool.classservice.repository;

import com.unifor.br.distrischool.classservice.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {

    Optional<ClassEntity> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}
