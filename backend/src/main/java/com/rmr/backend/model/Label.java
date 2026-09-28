package com.rmr.backend.model;

import java.time.LocalDate;

import org.springframework.util.StringUtils;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.type.LabelStatusType;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Enumerated;
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
public class Label {
    /** ラベルID */
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
    private Integer labelId;
    /** ユーザID */
    @NotNull
	@ManyToOne
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
    private Account user;
    /** ラベル */
    private String label;
    /** 状態(for param) */
    @Enumerated
	@NotNull
    private LabelStatusType statusType;
    /** 登録日 */
    private LocalDate registerDate;
    /** 更新日 */
    private LocalDate updateDate;

    /** ラベルを登録します。既に同名のラベルがあればそれを返します。 */
    public static Label findOrRegister(LabelRepository rep,AccountRepository aRep,Integer userId,String label) {
    return rep.findFirstByUserUserIdAndLabelOrderByLabelIdAsc(userId, label)
            .orElseGet(() -> {
                Account  registeredUser=aRep.findById(userId).orElseThrow(() -> new EntityNotFoundException("Account not found"));
            Label registeredLabel = Label.builder()
                .user(registeredUser)
                        .label(label)
                .statusType(LabelStatusType.VALID)
                .registerDate(LocalDate.now())
                        .build();

            return rep.save(registeredLabel);
        });
}

    /** 他エンティティに埋め込む、表示用のラベル情報。ラベル名が空の場合はnullを返す。 */
    public record LabelView(Integer labelId, String name) {
        public static LabelView viewOf(Label label) {
            if (label == null || !StringUtils.hasText(label.getLabel())) {
                return null;
            }
            return new LabelView(label.getLabelId(), label.getLabel());
        }
    }
}
