package com.rmr.backend.model;

import java.time.LocalDate;
import java.util.List;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.type.LabelStatusType;

import jakarta.persistence.CascadeType;
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
	@ManyToOne(cascade = CascadeType.ALL)
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

    /** ラベルを返します。 */
    public static List<Label> get(LabelRepository rep, Integer userId) {
        return rep.findByUserId(userId);
    }
    
    /** ラベルを登録します。存在すればそのまま返します。 */
    public static Label findOrRegister(LabelRepository rep,AccountRepository aRep,Integer userId,String label) {
    return rep.findByUserUserIdAndLabel(userId, label)
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
    /** 登録パラメタ(暫定対応) */
   @Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public static class RegisterLabel {
	private Integer userId;
	private String label;
}
}
