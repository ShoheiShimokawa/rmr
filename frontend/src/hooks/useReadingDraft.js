import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../api/reading";
import { queryKeys } from "../api/queryKeys";

// 入力が止まってからサーバへ送るまでの待ち時間
const DEBOUNCE_MS = 800;

/** 下書きとして残す価値のある入力かを返します。(本を選んだだけ・空白だけなら下書きにしない) */
export const hasDraftContent = ({ rate, thoughts, recommended } = {}) => {
  return (thoughts ?? "").trim() !== "" || (rate ?? 0) > 0 || !!recommended;
};

/** 2つの下書きの入力内容(評価・感想・推薦)が同じかを返します。 */
export const isSameDraftContent = (a, b) => {
  if (!a || !b) return false;
  return (
    (a.rate ?? 0) === (b.rate ?? 0) &&
    (a.thoughts ?? "") === (b.thoughts ?? "") &&
    !!a.recommended === !!b.recommended
  );
};

/** 下書きの保存状態を表す文言を返します。まだ下書きが無いときは自動保存されることを伝える。 */
export const draftStatusLabel = (status, hasDraft) => {
  if (status === "saving") return "Saving…";
  if (status === "error") return "Failed to save draft";
  return hasDraft ? "Draft saved" : "Drafts are saved automatically";
};

/** 自分の読書感想の下書きを更新日の新しい順に返します。 */
export const useReadingDrafts = (userId) => {
  return useQuery({
    queryKey: queryKeys.readingDrafts(userId),
    queryFn: async () => {
      const result = await api.findReadingDrafts();
      return result.data;
    },
    enabled: !!userId,
  });
};

/**
 * 読書感想の下書きを自動保存します。
 * saveDraftは入力のたびに呼んでよく、入力が止まってからまとめてサーバへ送る。
 * 内容が空になったらサーバ上の下書きを削除する。
 */
export const useReadingDraft = (userId) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("idle");
  const pendingRef = useRef(null);
  const timerRef = useRef(null);
  const inflightRef = useRef(Promise.resolve());

  const findCached = useCallback(
    (bookId) => {
      const drafts = queryClient.getQueryData(queryKeys.readingDrafts(userId)) ?? [];
      return drafts.find((d) => d.book?.bookId === bookId);
    },
    [queryClient, userId]
  );

  const upsertCache = useCallback(
    (draft) => {
      queryClient.setQueryData(queryKeys.readingDrafts(userId), (old = []) => [
        draft,
        ...old.filter((d) => d.book?.bookId !== draft.book?.bookId),
      ]);
    },
    [queryClient, userId]
  );

  const removeFromCache = useCallback(
    (bookId) => {
      queryClient.setQueryData(queryKeys.readingDrafts(userId), (old = []) =>
        old.filter((d) => d.book?.bookId !== bookId)
      );
    },
    [queryClient, userId]
  );

  // 溜まっている入力をサーバへ反映する。キャッシュ上の下書きと同じ内容なら送らない。
  const send = useCallback(
    async (values) => {
      const cached = findCached(values.bookId);
      if (hasDraftContent(values)) {
        if (isSameDraftContent(cached, values)) return;
        setStatus("saving");
        try {
          const result = await api.saveReadingDraft(values);
          upsertCache(result.data);
          setStatus("saved");
        } catch (error) {
          setStatus("error");
        }
      } else if (cached) {
        try {
          await api.deleteReadingDraft(values.bookId);
          removeFromCache(values.bookId);
          setStatus("idle");
        } catch (error) {
          setStatus("error");
        }
      }
    },
    [findCached, upsertCache, removeFromCache]
  );

  // 待機中の入力があれば即座に送る。送信は必ず直列にする。
  const flush = useCallback(() => {
    clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) {
      inflightRef.current = inflightRef.current.then(() => send(pending));
    }
    return inflightRef.current;
  }, [send]);

  const saveDraft = useCallback(
    (values) => {
      if (!userId || !values?.bookId) return;
      // 別の本の入力が待機中なら、取りこぼさないよう先に送る
      if (pendingRef.current && pendingRef.current.bookId !== values.bookId) {
        flush();
      }
      pendingRef.current = values;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [userId, flush]
  );

  const deleteDraft = useCallback(
    async (bookId) => {
      if (!userId || !bookId) return;
      if (pendingRef.current?.bookId === bookId) {
        clearTimeout(timerRef.current);
        pendingRef.current = null;
      }
      // 送信中の保存があれば、それが終わってから消す(消した後に復活しないように)
      inflightRef.current = inflightRef.current.then(async () => {
        try {
          await api.deleteReadingDraft(bookId);
          removeFromCache(bookId);
          setStatus("idle");
        } catch (error) {
          setStatus("error");
        }
      });
      return inflightRef.current;
    },
    [userId, removeFromCache]
  );

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  // 画面を離れる・アプリを閉じる直前に待機中の入力を送る(ベストエフォート)
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushRef.current();
    };
    const onPageHide = () => flushRef.current();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      flushRef.current();
    };
  }, []);

  return { saveDraft, deleteDraft, flush, status };
};
