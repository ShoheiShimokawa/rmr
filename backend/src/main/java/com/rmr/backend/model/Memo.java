package com.rmr.backend.model;

import java.time.Instant;

import com.rmr.backend.model.Account.UserSummary;
import com.rmr.backend.model.Label.LabelView;
import com.rmr.backend.type.HighlightVisibility;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
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
	@ManyToOne
    @JoinColumn(name = "user_id",referencedColumnName = "userId")
    private Account user;
    /** 引用文 */
    @Column(columnDefinition = "text")
    private String memo;
    /** メモ(なぜ心に残ったか) */
    @Column(columnDefinition = "text")
    private String note;
    /** ページ数 */
    private Integer page;
    /** ラベルID */
	@ManyToOne
    @JoinColumn(name = "label_id",referencedColumnName = "labelId")
    private Label label;
    /** 公開範囲。nullはPRIVATE扱い */
    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private HighlightVisibility visibility;
    /** ネタバレを含むか。nullはfalse扱い */
    private Boolean spoiler;
    /** 登録日 */
    private Instant registerDate;
    /** 更新日 */
    private Instant updateDate;
    /** 公開日 */
    private Instant publishedAt;

    /** 本人のIDと一致するかを返します。 */
    public boolean isOwnedBy(Integer userId) {
        return this.user.getUserId().equals(userId);
    }

    /** 公開設定かどうかを返します。 */
    public boolean isPublished() {
        return this.visibility == HighlightVisibility.PUBLIC;
    }

    /** ハイライトを新規作成します。非公開・ネタバレなしが初期状態。 */
    public static Memo create(Reading reading, Account user, HighlightFields fields, Label label, Instant now) {
        return Memo.builder()
                .reading(reading)
                .user(user)
                .memo(fields.quote())
                .note(fields.note())
                .page(fields.page())
                .label(label)
                .visibility(HighlightVisibility.PRIVATE)
                .spoiler(false)
                .registerDate(now)
                .updateDate(now)
                .build();
    }

    /** ハイライトの内容を変更します。更新日のみ進めます。 */
    public void applyEdit(HighlightFields fields, Label label, Boolean spoiler, Instant now) {
        this.memo = fields.quote();
        this.note = fields.note();
        this.page = fields.page();
        this.label = label;
        this.spoiler = spoiler != null && spoiler;
        this.updateDate = now;
    }

    /** 公開範囲を変更します。公開にした日時をpublishedAtに記録し、非公開に戻すとクリアします。 */
    public void changeVisibility(HighlightVisibility visibility, Boolean spoiler, Instant now) {
        this.visibility = visibility;
        this.spoiler = spoiler != null && spoiler;
        this.publishedAt = visibility == HighlightVisibility.PUBLIC ? now : null;
    }

    /** 入力項目(登録・更新共通) */
    public record HighlightFields(String quote, String note, Integer page, String label) {
    }

    /** 登録パラメタ */
    public record RegisterHighlight(Integer readingId, String quote, String note, Integer page, String label) {
    }

    /** 更新パラメタ */
    public record UpdateHighlight(Integer memoId, String quote, String note, Integer page, String label, Boolean spoiler) {
    }

    /** 削除・単体取得の更新系パラメタ */
    public record SpecifyMemoId(Integer memoId) {
    }

    /** 公開範囲変更パラメタ */
    public record ChangeVisibility(Integer memoId, HighlightVisibility visibility, Boolean spoiler) {
    }

    /** レスポンス用のハイライト表現。本人向けと公開向けでラベルの有無が異なる。 */
    public record HighlightView(
            Integer memoId,
            String quote,
            String note,
            Integer page,
            LabelView label,
            HighlightVisibility visibility,
            boolean spoiler,
            Instant registerDate,
            Instant updateDate,
            Instant publishedAt,
            Integer readingId,
            Book book,
            UserSummary user) {

        /** 本人向け(ラベルを含む全項目)のビューを返します。 */
        public static HighlightView forOwner(Memo memo) {
            return of(memo, LabelView.viewOf(memo.getLabel()));
        }

        /** 他人向け(ラベルを除いた)のビューを返します。 */
        public static HighlightView forPublic(Memo memo) {
            return of(memo, null);
        }

        private static HighlightView of(Memo memo, LabelView label) {
            return new HighlightView(
                    memo.getMemoId(),
                    memo.getMemo(),
                    memo.getNote(),
                    memo.getPage(),
                    label,
                    memo.getVisibility() == null ? HighlightVisibility.PRIVATE : memo.getVisibility(),
                    Boolean.TRUE.equals(memo.getSpoiler()),
                    memo.getRegisterDate(),
                    memo.getUpdateDate(),
                    memo.getPublishedAt(),
                    memo.getReading().getReadingId(),
                    memo.getReading().getBook(),
                    UserSummary.of(memo.getUser()));
        }
    }
}
