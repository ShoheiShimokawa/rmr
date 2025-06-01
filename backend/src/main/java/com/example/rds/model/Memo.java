package com.example.rds.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.rds.context.LabelRepository;
import com.example.rds.context.MemoRepository;
import com.example.rds.context.ReadingRepository;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class Memo {
    /** メモID */
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
    private Integer memoId;
    /** 読書ID */
    @ManyToOne
    @JoinColumn(name="readingId",referencedColumnName="readingId")
    private Reading reading;
    /** ユーザID */
    @NotNull
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
    private Account user;
    /** メモ */
    private String memo;
    /** ページ数 */
    private Integer page;
    /** ラベルID */
	@ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "label_id",referencedColumnName = "labelId")
    private Label label;
    /** 登録日 */
    private LocalDate registerDate;
    /** 更新日 */
    private LocalDate updateDate;

    /** メモを返します。 */
    public static Optional<Memo> getById(MemoRepository rep, Integer memoId) {
        return rep.findById(memoId);
    }

    /** ユーザに紐づくメモを返します。 */
    public static List<Memo> get(MemoRepository rep, Integer userId) {
        return rep.findByUserId(userId);
    }

    /** メモを登録します。 */
    public static Memo register(MemoRepository rep, ReadingRepository rRep,RegisterMemo params, Label label) {
        var reading=Reading.get(rRep,params.readingId);
        var user = reading.getUser();
        Memo memo = Memo.builder().reading(reading).user(user)
                .memo(params.memo).label(label)
                .page(params.page).build();
        return rep.save(memo);
    }

    /** 登録パラメタ */
    @Builder
    public static record RegisterMemo(
        Integer readingId,
        Integer userId,
        String memo,
        Integer page,
        String label
    ){};

 
    /** ラベリングされたメモを返します。 */
    public static List<ReadingMemoGroup> getGroupedMemos(MemoRepository rep,Integer userId) {
    List<Memo> memos = rep.findByUserId(userId);

    Map<Reading, Map<Label, List<Memo>>> grouped = memos.stream()
        .collect(Collectors.groupingBy(
            Memo::getReading,
            Collectors.groupingBy(Memo::getLabel)
        ));

    return grouped.entrySet().stream().map(readingEntry -> {
        Reading reading = readingEntry.getKey();

        List<LabelingMemo> labelingMemo = readingEntry.getValue().entrySet().stream()
            .map(labelEntry -> new LabelingMemo(
                new LabelDto(labelEntry.getKey().getLabelId(), labelEntry.getKey().getLabel()),
                labelEntry.getValue().stream()
                    .map(memo -> new MemoDto(memo.getMemoId(), memo.getMemo(),memo.getPage(), memo.getRegisterDate()))
                    .toList()
            ))
                .toList();

        return new ReadingMemoGroup(
            reading,
            labelingMemo
        );
    }).toList();
}

public record MemoDto(Integer memoId, String memo,Integer page, LocalDate registerDate) {}

public record LabelDto(Integer labelId, String label) {}

public record LabelingMemo(LabelDto label, List<MemoDto> memos) {}

public record ReadingMemoGroup(Reading reading,  List<LabelingMemo> labelingMemo) {}
    
}
