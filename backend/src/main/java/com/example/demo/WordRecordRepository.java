package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WordRecordRepository extends JpaRepository<WordRecord, Long> {
    Optional<WordRecord> findByWord(String word);
    void deleteByWord(String word);
    List<WordRecord> findByWordContainingOrMeaningContaining(String word, String meaning);
    List<WordRecord> findByWordIn(List<String> words);
}
