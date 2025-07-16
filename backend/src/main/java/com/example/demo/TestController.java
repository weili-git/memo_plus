package com.example.demo;

import com.example.demo.DTO.UpdateDTO;
import com.example.demo.DTO.WordsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {
    @Autowired
    private WordRecordService service;

    @GetMapping
    private List<WordRecord> getAllRecords() {
        return service.getAllRecords();
    }

    @GetMapping("/{word}")
    public ResponseEntity<WordRecord> getRecordByWord(@PathVariable String word) {
        Optional<WordRecord> record = service.getRecordByWord(word);
        return record.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRecord(@RequestBody WordRecord wordRecord) {
        Optional<WordRecord> existingRecord = service.getRecordByWord(wordRecord.getWord());
        if (existingRecord.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Record already exists.");
        } else {
            WordRecord wr = service.createOrUpdateRecord(wordRecord);
            return ResponseEntity.status(HttpStatus.CREATED).body(wr);
        }
    }

    // batch create
    @PostMapping("/batch")
    public ResponseEntity<?> createRecords(@RequestBody List<WordRecord> wordRecords) {
        int success = 0;
        int repeated = 0;
        List<String> repeated_words = new ArrayList<>();
        for (WordRecord wordRecord : wordRecords) {
            Optional<WordRecord> existingRecord = service.getRecordByWord(wordRecord.getWord());
            if (existingRecord.isPresent()) {
                repeated++;
                repeated_words.add(wordRecord.getWord());
            } else {
                WordRecord wr = service.createOrUpdateRecord(wordRecord); // 待优化，做成批量创建
                success++;
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("success", success, "repeated", repeated, "repeated_words", repeated_words)
        );
    }

    @PutMapping("/{word}")
    public ResponseEntity<WordRecord> updateRecord(@PathVariable String word, @RequestBody WordRecord record) {
        if (service.getRecordByWord(word).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        record.setWord(word);
        return ResponseEntity.ok(service.createOrUpdateRecord(record));
    }
    @DeleteMapping("/{word}")
    public ResponseEntity<Void> deleteRecord(@PathVariable String word) {
        if(service.getRecordByWord(word).isEmpty()){
            return ResponseEntity.notFound().build();
        }
        service.deleteRecord(word);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> handleUpload(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        try{
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'");
            String content = payload.get("content");
            String[] lines = content.split("\n");
            for (String line : lines) {
                String[] fields = line.split("\\|");
                if (fields.length==5) {
                    WordRecord record = new WordRecord();
                    record.setWord(fields[0]);
                    record.setMeaning(fields[1]);
                    record.setCreateTime(LocalDateTime.parse(fields[2], formatter));
                    record.setLastReview(LocalDateTime.parse(fields[3], formatter));
                    record.setReviewCount(Integer.valueOf(fields[4]));
                    service.saveRecord(record);
                }
            }
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/download")
    public ResponseEntity<?> handleDownload() {
        List<WordRecord> records = service.findAll();
        StringBuilder sb = new StringBuilder();
        for (WordRecord record: records) {
            sb.append(record.getWord())
                    .append("|")
                    .append(record.getMeaning())
                    .append("|")
                    .append(record.getCreateTime())
                    .append("|")
                    .append(record.getLastReview())
                    .append("|")
                    .append(record.getReviewCount())
                    .append("\n");
        }

        return ResponseEntity.ok().body(Map.of("success", true, "data", sb.toString()));
    }

    @GetMapping("/info")
    public ResponseEntity<?> getInfo() {
        try{
            List<LocalDateTime> createTimeAll = service.findAllCreateTimes();
            List<LocalDateTime> lastReviewAll = service.findAllLastReviews();
            return ResponseEntity.ok().body(Map.of("success", true, "createTime", createTimeAll, "lastReview", lastReviewAll));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }
    }

    @GetMapping("/random/{count}")
    public ResponseEntity<?> getRandomRecords(@PathVariable int count) {
        try {
            List<WordRecord> records = service.findAll();
            if(records.isEmpty()) {
                return ResponseEntity.ok().body(List.of());
            }
            Collections.shuffle(records, new Random());
            List<WordRecord> shuffled = records.stream().limit(count).toList();
            return ResponseEntity.ok().body(Map.of("success", true, "data", shuffled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/find/{keyword}")
    public ResponseEntity<?> getRecordsByKeyword(@PathVariable String keyword) {
        try {
            List<WordRecord> records = service.getRecordByKeyword(keyword);
            return ResponseEntity.ok().body(Map.of("success", true, "data", records));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getRecordsByCreateDate(@PathVariable String date) {
        try{
            // input local date
            LocalDate localDate = LocalDate.parse(date);
            ZoneId zoneId = ZoneId.of("Asia/Tokyo");
            ZonedDateTime start = localDate.atStartOfDay(zoneId).withZoneSameInstant(ZoneId.of("UTC"));
            ZonedDateTime end = localDate.atTime(LocalTime.MAX).atZone(zoneId).withZoneSameInstant(ZoneId.of("UTC"));
            List<WordRecord> records = service.getRecordByCreateDate(start.toLocalDateTime(), end.toLocalDateTime());
            return ResponseEntity.ok().body(Map.of("success", true, "records", records));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/review")
    public ResponseEntity<?> updateReviews(@RequestBody WordsDTO wordsDTO) {
        try {
            List<String> words = wordsDTO.getWords();
            List<WordRecord> records = service.findByWordIn(words);
            // store utc in db
            LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC).withNano(0);
            for (WordRecord record: records) {
                record.setReviewCount(record.getReviewCount() + 1);
                record.setLastReview(now);
            }
            service.saveRecords(records);
            return ResponseEntity.ok().body(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateMeaning(@RequestBody UpdateDTO updateDTO) {
        try{
            WordRecord record = new WordRecord(updateDTO.getWord(), updateDTO.getMeaning());
            service.updateRecord(record);
            return ResponseEntity.ok().body(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }
    }
}
