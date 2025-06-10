package com.example.rds.model;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.BookRepository;
import com.example.rds.context.ReadingRepository;
import com.example.rds.type.BookStatusType;
import com.example.rds.type.GenreType;

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
@Table(name = "reading", uniqueConstraints = {@UniqueConstraint(name = "reading_book", columnNames = {"book_id"})}) // FKにUNIQUE制約追加
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
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
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
	/** 読む予定登録日 */
	private Instant toReadDate;
	/** 読書開始日 */
	private Instant readingDate;
	/** 読了日 */
	private Instant readDate;

	/** ユーザIDと本IDで、そのユーザに紐づく読書があれば返します。 */
	public static Optional<Reading> getByUserIdAndBookId(ReadingRepository rep, Integer userId,Integer bookId) {
		return rep.findByUserUserIdAndBookBookId(userId, bookId).filter(r -> r.getStatusType() != BookStatusType.INVALID);
	}

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
	public static Reading get(ReadingRepository rep,Integer readingId) {
		return rep.findById(readingId).orElseThrow(() -> new EntityNotFoundException("Reading not found"));
	}
	
	/** 全ての読書を返します。 */
	public static List<Reading> findAll(ReadingRepository rep) {
		return rep.findAll();
	}
	
	/** ID(google)に紐付く読書を全て返します。 */
	public static List<Reading> findById(ReadingRepository rep, String id) {
		return rep.findById(id).stream()
              .filter(r -> r.getStatusType() != BookStatusType.INVALID)
              .collect(Collectors.toList());
	}

	/** ユーザに紐づく読書を全て返します*/
	public static List<Reading> findReadingsByUserId(ReadingRepository rep,Integer userId) {
		return rep.findReadingsByUserId(userId).stream()
              .filter(r -> r.getStatusType() != BookStatusType.INVALID)
              .collect(Collectors.toList());
	}
	
	/** 読書を取得します。 */
	public static List<Reading> findByBookId(ReadingRepository rep,Integer bookId){
		return rep.findByBookId(bookId).stream()
              .filter(r -> r.getStatusType() != BookStatusType.INVALID)
              .collect(Collectors.toList());
	}
	
	/** 読書を登録します。 */
	@Transactional
	public static Reading register(ReadingRepository rep,BookRepository bRep,AccountRepository aRep,RegisterReading param) {
		Book book= Book.get(bRep,param.bookId).orElseThrow(() -> new EntityNotFoundException("Book not found"));
		Account user = Account.get(aRep,param.userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
		
		Optional<Reading>existReading=Reading.getByUserIdAndBookId(rep, param.userId, param.bookId);
		if (existReading.isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Reading already exists.");
		}
		Reading reading=RegisterReading.builder().userId(param.userId).rate(param.rate).thoughts(param.thoughts).statusType(param.statusType).description(param.description).build().create();
		reading.setBook(book);
		reading.setUser(user);
		if (reading.getStatusType().equals(BookStatusType.NONE)) {
			reading.setToReadDate(Instant.now());
		}
		else if(reading.getStatusType().equals(BookStatusType.DOING)) {
			reading.setReadingDate(Instant.now());
		}
		else if(reading.getStatusType().equals(BookStatusType.DONE)) {
			reading.setReadDate(Instant.now());
		}
		return rep.save(reading);
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
	public static Reading update(ReadingRepository rep,UpdateReading params) {
		Reading reading = rep.findById(params.readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
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
	public record UpdateReading(Integer readingId,String userId,Integer bookId,Integer rate,BookStatusType statusType,String thoughts,boolean recommended) {
	}
	
	/** 読書を読書中にします。*/
	public static Reading toDoing(ReadingRepository rep,Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
		reading.setStatusType(BookStatusType.DOING);
		reading.setReadingDate(Instant.now());
		return rep.save(reading);
	}
	
	/** 読書を読書済みにします。 */
	public static Reading toDone(ReadingRepository rep,Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
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
	
	/** 月間読書記録を返します。*/
	public static List<MonthlyReading> getMonthlyReadingData(ReadingRepository rep,Integer userId) {
        List<Object[]> results = rep.findMonthlyReadingDataByUser(userId);

        // データを年月で正規化しながらグルーピング
        Map<String, Map<GenreType, Integer>> groupedData = new HashMap<>();

        for (Object[] record : results) {
            // 年月、アイテム、カウントを取得
            String yearMonth = ((String) record[0]);
            GenreType item = (GenreType) record[1];
            Long count =  (Long)record[2];
            Integer intCount = count.intValue();

            // 年月ごとのデータを処理
            groupedData.putIfAbsent(yearMonth, new HashMap<>());
            groupedData.get(yearMonth).merge(item, intCount, Integer::sum);
        }

        // 結果を MonthlyData のリストに変換
        return groupedData.entrySet().stream()
                .map(entry -> {
                    String yearMonth = entry.getKey();
                    Map<GenreType, Integer> details = entry.getValue();
                    int total = details.values().stream().mapToInt(Integer::intValue).sum();

                    // MonthlyData オブジェクトを生成
                    return new MonthlyReading(yearMonth, total, details);
                })
                .collect(Collectors.toList());
        }
	
	/** 月間読書記録*/
	@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public static class MonthlyReading {
    private String month;
    private Integer total;
    private Map<GenreType, Integer> breakdown;
}
	
}
