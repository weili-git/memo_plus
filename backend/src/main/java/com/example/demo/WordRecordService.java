package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class WordRecordService {
    @Autowired
    private WordRecordRepository repository;

    private static final Logger logger = Logger.getLogger(WordRecordService.class.getName());

    public List<WordRecord> getAllRecords() {
        return repository.findAll();
    }
    public WordRecord createOrUpdateRecord(WordRecord record) {
        return repository.save(record);
    }
    public void updateRecord(WordRecord record) {
        repository.findByWord(record.getWord()).ifPresent(
            newRecord -> {
                newRecord.setMeaning(record.getMeaning());
                repository.save(newRecord);
            });
    }
    public void deleteRecord(String word) {
        repository.deleteByWord(word);
    }
    public Optional<WordRecord> getRecordByWord(String word) {
        return repository.findByWord(word);
    }

    public void saveRecord(WordRecord record) {
        repository.save(record);
    }

    public void saveRecords(List<WordRecord> records) {
        repository.saveAll(records);
    }

    public long count() {
        return repository.count();
    }

    public List<WordRecord> findAll() {
        return repository.findAll();
    }

    public List<WordRecord> getRecordByKeyword(String keyword) {
        return repository.findByWordContainingOrMeaningContaining(keyword, keyword);
    }

    public List<LocalDateTime> findAllCreateTimes() {
        return repository.findAll().stream()
                .map(WordRecord::getCreateTime)
                .collect(Collectors.toList());
    }

    public List<LocalDateTime> findAllLastReviews() {
        return repository.findAll().stream()
                .filter(word -> !word.getCreateTime().equals(word.getLastReview()))
                .map(WordRecord::getLastReview)
                .collect(Collectors.toList());
    }

    public List<WordRecord> findByWordIn(List<String> words) {
        return repository.findByWordIn(words);
    }

    public List<WordRecord> getRecordByCreateDate(LocalDateTime start, LocalDateTime end) {
//        logger.info("Start DateTime: " + start);
//        logger.info("End DateTime: " + end);
        return repository.findAll().stream()
                .filter(record -> {
                    boolean inRange = !record.getCreateTime().isBefore(start) && !record.getCreateTime().isAfter(end);
//                    logger.info("Record createTime: " + record.getCreateTime() + ", inRange: " + inRange);
                    return inRange;
                }) // close interval
                .collect(Collectors.toList());
    }
}
