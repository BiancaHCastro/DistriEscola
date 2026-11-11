package com.unifor.br.distrischool.alunoservice.service;

import com.unifor.br.distrischool.alunoservice.model.Aluno;
import com.unifor.br.distrischool.alunoservice.repository.AlunoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AlunoService {

    private final AlunoRepository repository;

    public AlunoService(AlunoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Aluno cadastrar(Aluno aluno) {
        if (aluno.getMatricula() != null && repository.existsByMatricula(aluno.getMatricula())) {
            throw new IllegalArgumentException("Já existe um aluno com a matrícula: " + aluno.getMatricula());
        }
        return repository.save(aluno);
    }

    @Transactional(readOnly = true)
    public List<Aluno> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Aluno> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Aluno> buscarPorMatricula(String matricula) {
        return repository.findByMatricula(matricula);
    }

    @Transactional
    public void excluir(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public Optional<Aluno> atualizar(Long id, Aluno novosDados) {
        return repository.findById(id).map(aluno -> {
            aluno.setMatricula(novosDados.getMatricula());
            aluno.setNome(novosDados.getNome());
            aluno.setDataNascimento(novosDados.getDataNascimento());
            aluno.setEndereco(novosDados.getEndereco());
            aluno.setContato(novosDados.getContato());
            return repository.save(aluno);
        });
    }
}