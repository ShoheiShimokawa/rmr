package com.rmr.backend.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.BookRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.LargeGenreType;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.transaction.Transactional;
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
@Table(name = "reading", uniqueConstraints = { @UniqueConstraint(name = "reading_book", columnNames = { "book_id" }) })
public class Reading {
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	private Integer readingId;
	/** 本ID */
	@ManyToOne
	@JoinColumn(name = "book_id")
	private Book book;
	/** ユーザID */
	@NotNull
	@ManyToOne
	@JoinColumn(name = "user_id", referencedColumnName = "userId")
	private Account user;
	/** 進捗状態 */
	@Enumerated
	@NotNull
	private BookStatusType statusType;
	/** 評価 */
	private Integer rate;
	/** 感想 */
	private String thoughts;
	/** 登録日 */
	private Instant registerDate;
	/**  更新日 */
	private Instant updateDate;
	/** 読みたいリスト追加日 */
	private Instant toReadDate;
	/** 読書開始日 */
	private Instant readingDate;
	/** 読了日 */
	private Instant readDate;

	/** ユーザIDと本IDで、そのユーザに紐づく有効な読書があれば返します。 */
	public static Optional<Reading> getByUserIdAndBookId(ReadingRepository rep, Integer userId, Integer bookId) {
		return rep.findByUserUserIdAndBookBookId(userId, bookId)
				.filter(r -> r.getStatusType() != BookStatusType.INVALID);
	}

	/** ユーザIDと本IDで、そのユーザに紐づく読書があれば返します。 */
	//TODO:実装
	//フロント側でこのAPIをどう呼ぶかは考える

	/** 検索パラメタ */
	@Data
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class SearchReading {
		private Integer userId;
		private Integer bookId;
	}

	/** 読書IDで読書を取得します。 */
	public static Reading get(ReadingRepository rep, Integer readingId) {
		return rep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
	}

	/** 全ての読書を返します。 */
	public static List<Reading> findAll(ReadingRepository rep) {
		return rep.findAll();
	}

	/** 本のIDまたはISBNに紐付く有効な読書を全て返します。 */
	public static List<Reading> findByBookIdOrIsbn(ReadingRepository rep, String id, String isbn) {
		return rep.findByBookIdOrIsbn(id, isbn).stream()
				.filter(r -> r.getStatusType() != BookStatusType.INVALID)
				.collect(Collectors.toList());
	}

	/** ユーザに紐づく読書を全て返します*/
	public static List<Reading> findReadingsByUserId(ReadingRepository rep, Integer userId) {
		return rep.findReadingsByUserId(userId).stream()
				.filter(r -> r.getStatusType() != BookStatusType.INVALID)
				.collect(Collectors.toList());
	}

	/** 読書を取得します。 */
	public static List<Reading> findByBookId(ReadingRepository rep, Integer bookId) {
		return rep.findByBookId(bookId).stream()
				.filter(r -> r.getStatusType() != BookStatusType.INVALID)
				.collect(Collectors.toList());
	}

	/** 読書を登録します。 */
	//全体的に冗長な書き方なのでリファクタリングする。
	@Transactional
	public static Reading register(ReadingRepository rep, BookRepository bRep, AccountRepository aRep,
			RegisterReading param) {
		Book book = Book.get(bRep, param.bookId).orElseThrow(() -> new EntityNotFoundException("Book not found"));
		Account user = Account.get(aRep, param.userId).orElseThrow(() -> new EntityNotFoundException("User not found"));

		Optional<Reading> existReading = rep.findByUserUserIdAndBookBookId(user.getUserId(), book.getBookId());
		if (existReading.isPresent()) {
			Reading reading = existReading.get();
			if (param.rate!=0) reading.setRate(param.rate);
			if (!param.thoughts.isBlank()) reading.setThoughts(param.thoughts);
			reading.setUpdateDate(Instant.now());
			reading.setStatusType(param.statusType);
			//ここreadDateとか登録する必要ありそう。パラメータによって
			if (param.statusType.equals(BookStatusType.DONE)) {
				reading.setReadDate(Instant.now());
			}
			return rep.save(reading);
		} else {
			Reading reading = RegisterReading.builder().userId(param.userId).rate(param.rate).thoughts(param.thoughts)
					.statusType(param.statusType).description(param.description).build().create();
			reading.setBook(book);
			reading.setUser(user);
			switch (reading.getStatusType()) {
				case NONE -> reading.setToReadDate(Instant.now());
				case DOING -> reading.setReadingDate(Instant.now());
				case DONE -> reading.setReadDate(Instant.now());
				case INVALID -> {
				}
				default -> throw new IllegalStateException("Unexpected value: " + reading.getStatusType());
			}
			return rep.save(reading);
		}
		
	}

	/** 登録パラメタ */
	@Data
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class RegisterReading {
		private Integer userId;
		private Integer bookId;
		private Integer rate;
		private BookStatusType statusType;
		private String thoughts;
		private boolean recommended;
		private String description;

		public Reading create() {
			return Reading.builder()
					.rate(this.rate)
					.statusType(this.statusType)
					.thoughts(this.thoughts)
					.registerDate(Instant.now())
					.build();
		}
	}

	/** 読書を更新します。*/
	@Transactional
	public static Reading update(ReadingRepository rep, UpdateReading params) {
		Reading reading = rep.findById(params.readingId)
				.orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		reading.setRate(params.rate);
		reading.setThoughts(params.thoughts);
		reading.setUpdateDate(Instant.now());
		reading.setStatusType(params.statusType);
		if (params.statusType.equals(BookStatusType.DONE)) {
			reading.setReadDate(Instant.now());
		}
		return rep.save(reading);
	}

	/** 変更パラメタ */
	public record UpdateReading(Integer readingId, String userId, Integer bookId, Integer rate,
			BookStatusType statusType, String thoughts, boolean recommended) {
	}

	/** 読書を読書中にします。*/
	public static Reading toDoing(ReadingRepository rep, Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		reading.setStatusType(BookStatusType.DOING);
		reading.setReadingDate(Instant.now());
		return rep.save(reading);
	}

	/** 読書を読書済みにします。 */
	public static Reading toDone(ReadingRepository rep, Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		reading.setReadDate(Instant.now());
		return reading;
	}

	/** 読書を削除します。*/
	@Transactional
	public static void delete(ReadingRepository rep, Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
		reading.setStatusType(BookStatusType.INVALID);
		rep.save(reading);
	}

	/** 読書統計 */
	public record Analytics(Summary summary, StatusCounts status, List<MonthlyPoint> monthly,
			List<YearlyPoint> yearly, List<GenreCount> genres, List<AuthorCount> topAuthors) {

		/** 概況 */
		public record Summary(int done, int doneThisYear, int doneThisMonth, int doing, int toRead, Double avgRate) {
		}

		/** ステータス別件数 */
		public record StatusCounts(int toRead, int doing, int done) {
		}

		/** 月別の読了記録 */
		public record MonthlyPoint(String month, int total, Map<LargeGenreType, Integer> byLargeGenre) {
		}

		/** 年別の読了記録 */
		public record YearlyPoint(int year, int total) {
		}

		/** ジャンル別件数 */
		public record GenreCount(LargeGenreType largeGenre, int count) {
		}

		/** 著者別件数 */
		public record AuthorCount(String author, int count) {
		}

		/** 読書一覧から統計を組み立てます。(readingsはINVALIDを除いた状態で渡すこと) */
		public static Analytics of(List<Reading> readings, ZoneId zone, LocalDate today) {
			int toRead = 0;
			int doing = 0;
			int done = 0;
			int doneThisYear = 0;
			int doneThisMonth = 0;
			int rateSum = 0;
			int rateCount = 0;

			Map<String, Map<LargeGenreType, Integer>> monthlyByKey = new HashMap<>();
			Map<Integer, Integer> yearlyByYear = new HashMap<>();
			Map<LargeGenreType, Integer> genreCounts = new HashMap<>();
			Map<String, Integer> authorCounts = new HashMap<>();

			for (Reading reading : readings) {
				LargeGenreType largeGenre = reading.getBook() != null && reading.getBook().getLargeGenre() != null
						? reading.getBook().getLargeGenre() : LargeGenreType.UNKNOWN;
				genreCounts.merge(largeGenre, 1, Integer::sum);
				String author = reading.getBook() != null ? reading.getBook().getAuthor() : null;
				if (author != null && !author.isBlank()) {
					authorCounts.merge(author, 1, Integer::sum);
				}

				switch (reading.getStatusType()) {
					case NONE -> toRead++;
					case DOING -> doing++;
					case DONE -> {
						done++;
						if (reading.getRate() != null && reading.getRate() > 0) {
							rateSum += reading.getRate();
							rateCount++;
						}
						if (reading.getReadDate() != null) {
							LocalDate readLocalDate = reading.getReadDate().atZone(zone).toLocalDate();
							String monthKey = readLocalDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
							int year = readLocalDate.getYear();
							monthlyByKey.computeIfAbsent(monthKey, k -> new HashMap<>())
									.merge(largeGenre, 1, Integer::sum);
							yearlyByYear.merge(year, 1, Integer::sum);
							if (year == today.getYear()) {
								doneThisYear++;
								if (readLocalDate.getMonthValue() == today.getMonthValue()) {
									doneThisMonth++;
								}
							}
						}
					}
					case INVALID -> {
					}
					default -> throw new IllegalStateException("Unexpected value: " + reading.getStatusType());
				}
			}

			List<MonthlyPoint> monthly = monthlyByKey.entrySet().stream()
					.sorted(Map.Entry.comparingByKey())
					.map(entry -> new MonthlyPoint(entry.getKey(),
							entry.getValue().values().stream().mapToInt(Integer::intValue).sum(), entry.getValue()))
					.collect(Collectors.toList());

			List<YearlyPoint> yearly = yearlyByYear.entrySet().stream()
					.sorted(Map.Entry.comparingByKey())
					.map(entry -> new YearlyPoint(entry.getKey(), entry.getValue()))
					.collect(Collectors.toList());

			List<GenreCount> genres = genreCounts.entrySet().stream()
					.sorted(Map.Entry.<LargeGenreType, Integer>comparingByValue().reversed()
							.thenComparing(Map.Entry.comparingByKey()))
					.map(entry -> new GenreCount(entry.getKey(), entry.getValue()))
					.collect(Collectors.toList());

			List<AuthorCount> topAuthors = authorCounts.entrySet().stream()
					.sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
							.thenComparing(Map.Entry.comparingByKey()))
					.limit(5)
					.map(entry -> new AuthorCount(entry.getKey(), entry.getValue()))
					.collect(Collectors.toList());

			Double avgRate = rateCount > 0 ? (double) rateSum / rateCount : null;

			return new Analytics(new Summary(done, doneThisYear, doneThisMonth, doing, toRead, avgRate),
					new StatusCounts(toRead, doing, done), monthly, yearly, genres, topAuthors);
		}
	}
}
