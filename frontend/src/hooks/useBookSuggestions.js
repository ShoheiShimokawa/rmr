import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as api from "../api/book";
import { queryKeys } from "../api/queryKeys";
import { isBlank } from "../util";

const MIN_QUERY_LENGTH = 2;
// ひらがな・カタカナ・漢字は1文字からでも候補を出す
const JAPANESE_PATTERN = /[぀-ヿ一-鿿]/;

const meetsMinLength = (query) => {
  if (isBlank(query)) return false;
  return query.length >= MIN_QUERY_LENGTH || JAPANESE_PATTERN.test(query);
};

/**
 * 入力中の検索語から予測変換候補(登録済みの本のタイトル・著者)を返す。
 * enabledがfalseの間、または検索語が短すぎる間はリクエストしない。
 */
export const useBookSuggestions = (query, { enabled = true } = {}) => {
  const trimmed = (query || "").trim();

  return useQuery({
    queryKey: queryKeys.bookSuggestions(trimmed),
    queryFn: async ({ signal }) => {
      const result = await api.suggestBooks(trimmed, { signal });
      return result.data.items || [];
    },
    enabled: enabled && meetsMinLength(trimmed),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
