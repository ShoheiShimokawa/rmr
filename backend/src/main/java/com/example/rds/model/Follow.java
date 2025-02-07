package com.example.rds.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Follow {
	/** フォローID（自動採番） */
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer id;
	/** 対象ユーザ */
	private Integer userId;
	/** フォロワー */
	private Integer followerId;
	
}
