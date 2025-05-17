package com.example.rds.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Memo {
    /** メモID */
    private Integer memoId;
    /** 読書ID */
    private Integer readingId;
    /** ユーザID */
    private Integer userId;
    /** メモ */
    private String memo;
    /** ラベルID */
    private Integer labelId;
    /** 登録日 */
    private LocalDate registerDate;
    /** 更新日 */
    private LocalDate updateDate;
}
