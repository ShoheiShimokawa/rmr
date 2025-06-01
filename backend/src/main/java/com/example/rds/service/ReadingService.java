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
import com.example.rds.model.Reading.SearchReading;
import com.example.rds.model.Reading.UpdateReading;
import com.example.rds.type.BookStatusType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadingService {
	private final ReadingRepository rep;
	private final BookRepository bRep;
	private final PostRepository pRep;
	private final AccountRepository aRep;

	public Reading getByUserIdAndBookId(Integer userId,Integer bookId){
		return Reading.getByUserIdAndBookId(rep, userId,bookId).orElse(null); 
	}

	/** 全ての読書を返します。 */
	public List<Reading> findAll() {
		return Reading.findAll(rep);
	}

	/** ID(google)に紐付く読書を全て返します。 */
	public List<Reading> findById(String id) {
		return Reading.findById(rep,id);
	}

	/** ユーザに紐づく全ての読書を返します */
	public List<Reading> findReadingsByUserId(Integer userId) {
		return Reading.findReadingsByUserId(rep, userId);
	}
	
	public List<Reading> findByBookId(Integer bookId) {
		return Reading.findByBookId(rep, bookId);
	}

	/** 読書を登録します。*/
	public Reading register(RegisterReading param) {
		var reading =Reading.register(rep, bRep,aRep, param);
		var readingId = reading.getReadingId();
		if(reading.getStatusType()==BookStatusType.DONE){
		Post.registerPost(pRep,rep,readingId);
		}
		return reading;
	}

	/** 読書を更新します。 */
	public Reading update(UpdateReading params) {
		Reading reading = Reading.update(rep, params);
		if (reading.getStatusType().equals(BookStatusType.DONE)) {
			Post.registerPost(pRep, rep, reading.getReadingId());
		}
		return reading;
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
