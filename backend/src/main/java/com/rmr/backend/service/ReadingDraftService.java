package com.rmr.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingDraftRepository;
import com.rmr.backend.model.ReadingDraft;
import com.rmr.backend.model.ReadingDraft.SaveReadingDraft;
import com.rmr.backend.util.BadRequestException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReadingDraftService {
	/** 下書きとして受け付ける感想の最大文字数 */
	static final int MAX_THOUGHTS_LENGTH = 5000;

	private final ReadingDraftRepository rep;
	private final BookRepository bRep;
	private final AccountRepository aRep;

	/** 自分の下書きを更新日の新しい順に返します。 */
	public List<ReadingDraft> findByUserId(Integer currentUserId) {
		return ReadingDraft.findByUserId(rep, currentUserId);
	}

	/** 自分の下書きを保存します。同じ本の下書きがあれば上書きします。 */
	public ReadingDraft save(Integer currentUserId, SaveReadingDraft params) {
		if (params.bookId() == null) {
			throw new BadRequestException("bookId is required.");
		}
		String thoughts = params.thoughts() == null ? "" : params.thoughts();
		if (thoughts.length() > MAX_THOUGHTS_LENGTH) {
			throw new BadRequestException("Draft must be under " + MAX_THOUGHTS_LENGTH + " characters.");
		}
		Integer rate = params.rate() == null ? 0 : params.rate();
		return ReadingDraft.save(rep, bRep, aRep, currentUserId,
				new SaveReadingDraft(params.bookId(), rate, thoughts, params.recommended()));
	}

	/** 自分の下書きを削除します。 */
	public void delete(Integer currentUserId, Integer bookId) {
		if (bookId == null) {
			throw new BadRequestException("bookId is required.");
		}
		ReadingDraft.delete(rep, currentUserId, bookId);
	}
}
