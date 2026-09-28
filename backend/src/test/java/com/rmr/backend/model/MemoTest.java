package com.rmr.backend.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.rmr.backend.model.Memo.HighlightFields;
import com.rmr.backend.model.Memo.HighlightView;
import com.rmr.backend.type.HighlightVisibility;

class MemoTest {

	private Memo memoWithLabel() {
		Account user = Account.builder().userId(2).handle("reader").build();
		Reading reading = Reading.builder().readingId(10).user(user).book(Book.builder().bookId(1).build()).build();
		Label label = Label.builder().labelId(3).label("work").build();
		return Memo.create(reading, user, new HighlightFields("quote", null, null, null), label, Instant.now());
	}

	@Test
	void forOwnerIncludesTheLabel() {
		HighlightView view = HighlightView.forOwner(memoWithLabel());

		assertThat(view.label()).isNotNull();
		assertThat(view.label().name()).isEqualTo("work");
	}

	@Test
	void forPublicHidesTheLabel() {
		HighlightView view = HighlightView.forPublic(memoWithLabel());

		assertThat(view.label()).isNull();
	}

	@Test
	void createStartsPrivateAndUnspoiledWithBothDatesSetToNow() {
		Memo memo = memoWithLabel();

		assertThat(memo.isPublished()).isFalse();
		assertThat(HighlightView.forOwner(memo).visibility()).isEqualTo(HighlightVisibility.PRIVATE);
		assertThat(memo.getSpoiler()).isFalse();
		assertThat(memo.getRegisterDate()).isEqualTo(memo.getUpdateDate());
	}

	@Test
	void isOwnedByComparesTheUserId() {
		Memo memo = memoWithLabel();

		assertThat(memo.isOwnedBy(2)).isTrue();
		assertThat(memo.isOwnedBy(99)).isFalse();
	}

	@Test
	void applyEditUpdatesFieldsAndBumpsOnlyTheUpdateDate() {
		Instant registeredAt = Instant.parse("2026-01-01T00:00:00Z");
		Instant editedAt = Instant.parse("2026-02-01T00:00:00Z");
		Account user = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(user).book(Book.builder().bookId(1).build()).build();
		Memo memo = Memo.create(reading, user, new HighlightFields("original", null, null, null), null, registeredAt);

		memo.applyEdit(new HighlightFields("edited", "note", 42, null), null, true, editedAt);

		assertThat(memo.getMemo()).isEqualTo("edited");
		assertThat(memo.getNote()).isEqualTo("note");
		assertThat(memo.getPage()).isEqualTo(42);
		assertThat(memo.getSpoiler()).isTrue();
		assertThat(memo.getRegisterDate()).isEqualTo(registeredAt);
		assertThat(memo.getUpdateDate()).isEqualTo(editedAt);
	}

	@Test
	void changeVisibilitySetsPublishedAtWhenGoingPublicAndClearsItWhenGoingPrivate() {
		Memo memo = memoWithLabel();
		Instant publishedAt = Instant.parse("2026-01-01T00:00:00Z");

		memo.changeVisibility(HighlightVisibility.PUBLIC, false, publishedAt);
		assertThat(memo.getPublishedAt()).isEqualTo(publishedAt);
		assertThat(memo.isPublished()).isTrue();

		memo.changeVisibility(HighlightVisibility.PRIVATE, false, Instant.parse("2026-01-02T00:00:00Z"));
		assertThat(memo.getPublishedAt()).isNull();
		assertThat(memo.isPublished()).isFalse();
	}

	@Test
	void nullVisibilityAndSpoilerFallBackToPrivateAndFalseInTheView() {
		// registerDate等が未設定の既存データ(登録日時がnullの旧レコード)を模した状態。
		Account user = Account.builder().userId(2).build();
		Reading reading = Reading.builder().readingId(10).user(user).book(Book.builder().bookId(1).build()).build();
		Memo legacyMemo = Memo.builder().memoId(5).user(user).reading(reading).memo("quote").build();

		HighlightView view = HighlightView.forOwner(legacyMemo);

		assertThat(view.visibility()).isEqualTo(HighlightVisibility.PRIVATE);
		assertThat(view.spoiler()).isFalse();
		assertThat(legacyMemo.isPublished()).isFalse();
	}
}
