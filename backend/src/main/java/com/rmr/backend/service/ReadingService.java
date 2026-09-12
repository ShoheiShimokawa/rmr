package com.rmr.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.PostRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Post;
import com.rmr.backend.model.Reading;
import com.rmr.backend.model.Reading.MonthlyReading;
import com.rmr.backend.model.Reading.RegisterReading;
import com.rmr.backend.model.Reading.UpdateReading;
import com.rmr.backend.type.BookStatusType;

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

	/** 本のIDまたはISBNに紐付く読書を全て返します。ISBNが空文字列の場合は未指定として扱う。 */
	public List<Reading> findByBookIdOrIsbn(String id, String isbn) {
		return Reading.findByBookIdOrIsbn(rep, id, StringUtils.hasText(isbn) ? isbn : null);
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
		if(reading.getStatusType()==BookStatusType.DONE && (!reading.getThoughts().equals("")) || param.isRecommended()  ){
			Post.registerPost(pRep,rep,readingId,param.isRecommended());
		}
		return reading;
	}

	/** 読書を更新します。(自分の読書のみ) */
	public Reading update(Integer currentUserId, UpdateReading params) {
		requireOwnership(params.readingId(), currentUserId);
		Reading reading = Reading.update(rep, params);
		if (reading.getStatusType().equals(BookStatusType.DONE) && (!reading.getThoughts().equals("") || reading.getRate()!=0)) {
			Post.registerPost(pRep, rep, reading.getReadingId(),params.recommended());
		}
		return reading;
	}

	/** 未読の読書を読書中にします。(自分の読書のみ) */
	public Reading toDoing(Integer readingId, Integer currentUserId) {
		requireOwnership(readingId, currentUserId);
		return Reading.toDoing(rep, readingId);
	}

	/** 読書を削除します。(自分の読書のみ) */
	public void delete(Integer readingId, Integer currentUserId) {
		requireOwnership(readingId, currentUserId);
		Reading.delete(rep, readingId);
	}

	/** 読書の所有者が本人であることを確認します。所有者でなければ403を返します。 */
	private void requireOwnership(Integer readingId, Integer currentUserId) {
		Reading reading = Reading.get(rep, readingId);
		if (!reading.getUser().getUserId().equals(currentUserId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this reading.");
		}
	}
	
	/** 月間読書記録を返します。*/
	public List<MonthlyReading> getMonthlyReading(Integer userId){
		return Reading.getMonthlyReadingData(rep,userId);
	}
}
