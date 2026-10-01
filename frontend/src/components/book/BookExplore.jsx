import { useContext, useState } from "react";
import { Box, Divider } from "@mui/material";
import UserContext from "../UserProvider";
import { BookSearch } from "./BookSearch";
import { BookRow } from "./BookRow";
import { BookDetail } from "./BookDetail";
import { CustomDialog } from "../../ui/CustomDialog";
import {
  useTopRatedBooks,
  usePopularBooks,
  useFollowingBooks,
} from "../../hooks/useBookDiscovery";

/**
 * /bookページ。検索窓の下に発見セクション(評価の高い本・今読まれている本・フォロー中の人の本)を
 * 1枚のカードにまとめて並べ、検索中(入力あり)はそれらを隠して検索結果だけを表示する。
 */
export const BookExplore = () => {
  const { user } = useContext(UserContext);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [open, setOpen] = useState(false);

  const { data: topRated = [], isLoading: loadingTopRated } = useTopRatedBooks();
  const { data: popular = [], isLoading: loadingPopular } = usePopularBooks();
  const { data: following = [], isLoading: loadingFollowing } = useFollowingBooks(user?.userId);

  const handleSelect = (book) => {
    setSelectedBook(book);
    setOpen(true);
  };

  const topRatedSection = (loadingTopRated || topRated.length > 0) && (
    <BookRow
      title="Top rated on ReadMyReads 🌹"
      loading={loadingTopRated}
      items={topRated.map((ranked) => ({
        key: ranked.book.bookId,
        book: ranked.book,
      }))}
      onSelect={handleSelect}
    />
  );

  const popularSection = (loadingPopular || popular.length > 0) && (
    <BookRow
      title="Popular right now 🔥"
      loading={loadingPopular}
      items={popular.map((ranked) => ({
        key: ranked.book.bookId,
        book: ranked.book,
      }))}
      onSelect={handleSelect}
    />
  );

  const followingSection = user && (
    <BookRow
      title="From people you follow 🤟"
      loading={loadingFollowing}
      emptyText="Follow someone to see what they're reading. Find people in the Community tab."
      items={following.map((activity) => ({
        key: activity.book.bookId,
        book: activity.book,
      }))}
      onSelect={handleSelect}
    />
  );

  const sections = [topRatedSection, popularSection, followingSection].filter(Boolean);

  return (
    <div>
      <CustomDialog open={open} title="detail" onClose={() => setOpen(false)}>
        <BookDetail book={selectedBook} />
      </CustomDialog>

      <BookSearch onResultsChange={setSearching} />

      {!searching && sections.length > 0 && (
        <Box sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
          {sections.map((section, index) => (
            <Box key={index} sx={{ p: 2 }}>
              {section}
              {index < sections.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
};
