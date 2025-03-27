package com.example.rds.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.BookRepository;
import com.example.rds.context.PostRepository;
import com.example.rds.context.ReadingRepository;
import com.example.rds.model.Post;
import com.example.rds.model.Reading;
import com.example.rds.model.Reading.MonthlyReading;
import com.example.rds.model.Reading.RegisterReading;
import com.example.rds.model.Reading.UpdateReading;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadingService {
	private final ReadingRepository rep;
	private final BookRepository bRep;
	private final PostRepository pRep;
	private final AccountRepository aRep;

	/** 全ての読書を返します。 */
	public List<Reading> findAll() {
		return Reading.findAll(rep);
	}

	/** ユーザに紐づく全ての読書を返します */
	public List<Reading> findReadingsByUserId(Integer userId) {
		return Reading.findReadingsByUserId(rep, userId);
	}
	
	public Reading findByBookId(Integer bookId) {
		return Reading.findByBookId(rep, bookId);
	}

	/** 読書を登録します。*/
	public Reading register(RegisterReading param) {
		var reading =Reading.register(rep, bRep,aRep, param);
		Post.registerPost(pRep,rep,reading.getReadingId());
		return reading;
	}

	/** 読書を更新します。 */
	public Reading update(UpdateReading params) {
		//TODO:POST分も書く
		return Reading.update(rep, params);
	}

	/** 未読の読書を読書中にします。 */
	public Reading toDoing(Integer readingId) {
		return Reading.toDoing(rep, readingId);
	}

	/** 読書を削除します。 */
	public void delete(Integer readingId) {
		Reading.delete(rep, readingId);
	}
	
	/** 月間読書記録を返します。*/
	public List<MonthlyReading> getMonthlyReading(Integer userId){
		return Reading.getMonthlyReadingData(rep,userId);
	}
}
