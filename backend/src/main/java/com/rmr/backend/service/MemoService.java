package com.rmr.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.context.MemoRepository;
import com.rmr.backend.context.ReadingRepository;
import com.rmr.backend.model.Label;
import com.rmr.backend.model.Memo;
import com.rmr.backend.model.Memo.HighlightFields;
import com.rmr.backend.model.Memo.HighlightView;
import com.rmr.backend.model.Memo.RegisterHighlight;
import com.rmr.backend.model.Memo.UpdateHighlight;
import com.rmr.backend.model.Reading;
import com.rmr.backend.type.BookStatusType;
import com.rmr.backend.type.HighlightVisibility;
import com.rmr.backend.util.BadRequestException;
import com.rmr.backend.util.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemoService {
    static final int MAX_QUOTE_LENGTH = 500;
    static final int MAX_NOTE_LENGTH = 1000;
    static final int MAX_LABEL_LENGTH = 30;
    static final int MIN_PAGE = 1;
    static final int MAX_PAGE = 99_999;

    private final MemoRepository rep;
    private final ReadingRepository rRep;
    private final LabelRepository lRep;
    private final AccountRepository aRep;

    /** ユーザのハイライトを返します。本人には全件、それ以外には公開分のみを返します。 */
    public List<HighlightView> findByUser(Integer userId, Integer viewerId) {
        if (userId.equals(viewerId)) {
            return rep.findAllByUserIdNewestFirst(userId).stream().map(HighlightView::forOwner).toList();
        }
        return rep.findByUserIdAndVisibilityNewestFirst(userId, HighlightVisibility.PUBLIC).stream()
                .map(HighlightView::forPublic).toList();
    }

    /** ハイライトを1件返します。本人以外には公開設定のものだけを返します。 */
    public HighlightView findById(Integer memoId, Integer viewerId) {
        Memo memo = rep.findById(memoId).orElseThrow(() -> new NotFoundException("Highlight not found."));
        if (memo.isOwnedBy(viewerId)) {
            return HighlightView.forOwner(memo);
        }
        if (memo.isPublished()) {
            return HighlightView.forPublic(memo);
        }
        throw new NotFoundException("Highlight not found.");
    }

    /** ハイライトを登録します。(自分の読書に対してのみ) */
    @Transactional
    public HighlightView register(Integer currentUserId, RegisterHighlight params) {
        Reading reading = rRep.findById(params.readingId())
                .orElseThrow(() -> new NotFoundException("Reading not found."));
        if (!reading.getUser().getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this reading.");
        }
        if (reading.getStatusType() == BookStatusType.INVALID) {
            throw new BadRequestException("This reading no longer exists.");
        }
        HighlightFields fields = normalize(params.quote(), params.note(), params.page(), params.label());
        Label label = resolveLabel(currentUserId, fields.label());
        Memo memo = Memo.create(reading, reading.getUser(), fields, label, Instant.now());
        return HighlightView.forOwner(rep.save(memo));
    }

    /** ハイライトを更新します。(本人のみ) */
    @Transactional
    public HighlightView update(Integer currentUserId, UpdateHighlight params) {
        Memo memo = requireOwnedMemo(params.memoId(), currentUserId);
        HighlightFields fields = normalize(params.quote(), params.note(), params.page(), params.label());
        Label label = resolveLabel(currentUserId, fields.label());
        memo.applyEdit(fields, label, params.spoiler(), Instant.now());
        return HighlightView.forOwner(rep.save(memo));
    }

    /** ハイライトを削除します。(本人のみ) */
    @Transactional
    public void delete(Integer currentUserId, Integer memoId) {
        rep.delete(requireOwnedMemo(memoId, currentUserId));
    }

    /** 本人が所有するハイライトを返します。存在しない場合と他人のものである場合を区別せず404にします。 */
    private Memo requireOwnedMemo(Integer memoId, Integer currentUserId) {
        Memo memo = rep.findById(memoId).orElseThrow(() -> new NotFoundException("Highlight not found."));
        if (!memo.isOwnedBy(currentUserId)) {
            throw new NotFoundException("Highlight not found.");
        }
        return memo;
    }

    private Label resolveLabel(Integer userId, String labelName) {
        return labelName == null ? null : Label.findOrRegister(lRep, aRep, userId, labelName);
    }

    /** 入力を正規化し、文字数・ページ番号の妥当性を検証します。 */
    static HighlightFields normalize(String quote, String note, Integer page, String label) {
        String normalizedQuote = normalizeText(quote);
        if (!StringUtils.hasText(normalizedQuote)) {
            throw new BadRequestException("Quote is required.");
        }
        if (normalizedQuote.length() > MAX_QUOTE_LENGTH) {
            throw new BadRequestException("Quote must be " + MAX_QUOTE_LENGTH + " characters or fewer.");
        }
        String normalizedNote = normalizeText(note);
        if (normalizedNote != null && normalizedNote.length() > MAX_NOTE_LENGTH) {
            throw new BadRequestException("Note must be " + MAX_NOTE_LENGTH + " characters or fewer.");
        }
        String normalizedLabel = normalizeText(label);
        if (normalizedLabel != null && normalizedLabel.length() > MAX_LABEL_LENGTH) {
            throw new BadRequestException("Label must be " + MAX_LABEL_LENGTH + " characters or fewer.");
        }
        if (page != null && (page < MIN_PAGE || page > MAX_PAGE)) {
            throw new BadRequestException("Page must be between " + MIN_PAGE + " and " + MAX_PAGE + ".");
        }
        return new HighlightFields(normalizedQuote, normalizedNote, page, normalizedLabel);
    }

    private static String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.replace("\r\n", "\n").strip();
        return StringUtils.hasText(normalized) ? normalized : null;
    }
}
