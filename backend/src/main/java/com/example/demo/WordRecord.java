package com.example.demo;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name="word_record")
public class WordRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String word;
    @Column
    private String meaning;
    @Column
    private LocalDateTime createTime;
    @Column
    private LocalDateTime lastReview;
    @Column
    @JsonProperty("reviewCount")
    private Integer reviewCount;

    public WordRecord() {}

    public WordRecord(String word, String meaning) {
        this.word = word;
        this.meaning = meaning;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getLastReview() {
        return lastReview;
    }

    public void setLastReview(LocalDateTime lastReview) {
        this.lastReview = lastReview;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer review_count) {
        this.reviewCount = review_count;
    }

    @PrePersist
    protected void onCreate() {
        // store utc into db
        createTime = LocalDateTime.now(ZoneOffset.UTC).withNano(0);
        lastReview = createTime;
        reviewCount = 0;
    }
}
