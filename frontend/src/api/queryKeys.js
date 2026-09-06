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
};
