// react-queryのqueryKeyを1箇所に集約する。
// フック側(useQuery)とinvalidate/setQueryData側の両方が必ずここ経由でキーを組み立てることで、
// 文字列リテラルの書き間違いによるキャッシュミスを防ぐ。
export const queryKeys = {
  posts: () => ["posts"],
  goodPosts: (userId) => ["goodPosts", userId],
  postGooders: (postId) => ["postGooders", postId],
  postsByBook: (bookId) => ["postsByBook", bookId],
  followers: (userId) => ["followers", userId],
  follows: (followerId) => ["follows", followerId],
  readingsByBook: (bookId) => ["readingsByBook", bookId],
  readingsByUser: (userId) => ["readingsByUser", userId],
  readingDrafts: (userId) => ["readingDrafts", userId],
  analytics: (userId) => ["analytics", userId],
  bookSuggestions: (query) => ["bookSuggestions", query],
  topRatedBooks: () => ["topRatedBooks"],
  popularBooks: () => ["popularBooks"],
  // フォロー中の本はログインユーザーごとに内容が変わるため、キーにviewerIdを含める。
  followingBooks: (viewerId) => ["followingBooks", viewerId ?? null],
  notifications: (userId) => ["notifications", userId],
  // ハイライトは閲覧者によって見える範囲が変わるため、キーにviewerIdを含める。
  // invalidateQueriesはキーの前方一致で効くので、viewerIdを問わず消したい場合は
  // highlightsByUserAll/highlightAll (userId/memoIdのみ)を使う。
  highlightsByUserAll: (userId) => ["highlightsByUser", userId],
  highlightsByUser: (userId, viewerId) => ["highlightsByUser", userId, viewerId ?? null],
  highlightAll: (memoId) => ["highlight", Number(memoId)],
  highlight: (memoId, viewerId) => ["highlight", Number(memoId), viewerId ?? null],
};
