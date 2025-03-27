package com.example.rds.model;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.rds.context.AccountRepository;
import com.example.rds.context.BookRepository;
import com.example.rds.context.ReadingRepository;
import com.example.rds.type.BookStatusType;
import com.example.rds.type.GenreType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
	@OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "book_id")
	private Book book;
	/** ユーザID */
	@NotNull
	@ManyToOne(cascade = CascadeType.ALL)
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
	/** 備考 */
	private String description;
	/** 登録日 */
	private LocalDate registerDate;
	/**  更新日 */
	private LocalDate updateDate;
	/** 読了日 */
	private LocalDate readDate;
	
	/** 全ての読書を返します。 */
	public static List<Reading> findAll(ReadingRepository rep){
		return rep.findAll();
	}
	/** ユーザに紐づく本を全て返します*/
	public static List<Reading> findReadingsByUserId(ReadingRepository rep,Integer userId) {
		return rep.findReadingsByUserId(userId);
	}
	
	/** 読書を取得します。 */
	public static Reading findByBookId(ReadingRepository rep,Integer bookId){
		return rep.findByBookId(bookId);
	}
	
	/** 読書を登録します。 */
	@Transactional
	public static Reading register(ReadingRepository rep,BookRepository bRep,AccountRepository aRep,RegisterReading param) {
		Book book= Book.get(bRep,param.bookId).orElseThrow(() -> new EntityNotFoundException("Book not found"));
		Account user = Account.get(aRep,param.userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
		//TODO:ユーザIDで検索して、読書を全件取得。その後bookIDで検索して存在するんだったら返却する。
		Reading reading=RegisterReading.builder().userId(param.userId).rate(param.rate).thoughts(param.thoughts).statusType(param.statusType).description(param.description).build().create();
		reading.setBook(book);
		reading.setUser(user);
		if(reading.getStatusType().equals(BookStatusType.DONE)) {
			reading.setReadDate(LocalDate.now());
		}
		return rep.save(reading);
	}
	/** 登録パラメタ */
	@Builder
	public record RegisterReading(Integer userId,Integer bookId,Integer rate,BookStatusType statusType,String thoughts,String description) {
		public Reading create() {
			return Reading.builder().rate(this.rate).statusType(this.statusType).thoughts(this.thoughts).description(this.description).registerDate(LocalDate.now()).build();
		}
	}
	
	/** 読書を更新します。*/
	@Transactional
	public static Reading update(ReadingRepository rep,UpdateReading params) {
		Reading reading = rep.findById(params.readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
		reading.setRate(params.rate);
		reading.setThoughts(params.thoughts);
		reading.setDescription(params.description);
		reading.setUpdateDate(LocalDate.now());		
		reading.setStatusType(params.statusType);
		if(params.statusType.equals(BookStatusType.DONE)) {
			reading.setReadDate(LocalDate.now());		}
		return rep.save(reading);
	}
	/** 変更パラメタ */
	public record UpdateReading(Integer readingId,String userId,Integer bookId,Integer rate,BookStatusType statusType,String thoughts,String description) {
	}
	
	/** 読書を読書中にします。*/
	public static Reading toDoing(ReadingRepository rep,Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
		reading.setStatusType(BookStatusType.DOING);
		return rep.save(reading);
	}
	
	/** 読書を読書済みにします。 */
	public static Reading toDone(ReadingRepository rep,Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
		reading.setReadDate(LocalDate.now());
		return reading;
	}
	
	/** 読書を削除します。*/
	@Transactional
	public static void delete(ReadingRepository rep,Integer readingId) {
		Reading reading = rep.findById(readingId).orElseThrow(()->new EntityNotFoundException("Reading not found"));
		rep.deleteById(reading.readingId);
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
	@Builder
	public record MonthlyReading(String month,Integer total,Map<GenreType,Integer>breakdown) {}
	
}
