package com.rmr.backend.context;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.rmr.backend.model.Account;
import com.rmr.backend.model.Book;
import com.rmr.backend.model.Reading;
import com.rmr.backend.type.BookStatusType;

/**
 * 同じ本が別のsourceId(プロバイダを跨いだ再検索等)で登録し直された場合でも、
 * ISBN一致で読書記録を見つけられることを実データベースで検証する。
 */
@SpringBootTest
@Transactional
class ReadingRepositoryIsbnFallbackTest {

	@Autowired
	private ReadingRepository readingRepository;
	@Autowired
	private BookRepository bookRepository;
	@Autowired
	private AccountRepository accountRepository;

	private Account saveTestAccount() {
		String unique = "isbn-fallback-" + System.nanoTime();
		return accountRepository.save(Account.builder()
				.googleSub(unique)
				.handle(unique)
				.name("test")
				.build());
	}

	@Test
	void findsReadingByIsbnWhenSourceIdDiffersFromCurrentSearch() {
		Account user = saveTestAccount();
		Book book = bookRepository.save(Book.builder()
				.id("old-provider-source-id")
				.isbn("9784000000001")
				.title("test book")
				.build());
		Reading reading = readingRepository.save(Reading.builder()
				.book(book)
				.user(user)
				.statusType(BookStatusType.DOING)
				.build());

		var found = readingRepository.findByBookIdOrIsbn("new-provider-source-id", "9784000000001");

		assertThat(found).extracting(Reading::getReadingId).containsExactly(reading.getReadingId());
	}

	@Test
	void findsReadingBySourceIdWhenIsbnIsAbsent() {
		Account user = saveTestAccount();
		Book book = bookRepository.save(Book.builder()
				.id("no-isbn-source-id")
				.title("test book without isbn")
				.build());
		Reading reading = readingRepository.save(Reading.builder()
				.book(book)
				.user(user)
				.statusType(BookStatusType.DOING)
				.build());

		var found = readingRepository.findByBookIdOrIsbn("no-isbn-source-id", null);

		assertThat(found).extracting(Reading::getReadingId).containsExactly(reading.getReadingId());
	}

	@Test
	void returnsEmptyWhenNeitherSourceIdNorIsbnMatch() {
		var found = readingRepository.findByBookIdOrIsbn("no-such-source-id", "9789999999999");

		assertThat(found).isEmpty();
	}
}
