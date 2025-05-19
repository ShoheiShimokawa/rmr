package com.example.rds.model;

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Label {
    /** ラベルID */
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
    private Integer labelId;
    /** ユーザID */
    @NotNull
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
    private Account user;
    /** ラベル */
    private String name;
    /** 登録日 */
    private LocalDate registerDate;
    /** 更新日 */
    private LocalDate updateDate;
}
