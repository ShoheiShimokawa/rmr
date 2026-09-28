import { useMemo, useState } from "react";
import { Box, MenuItem, Paper, Select, TextField } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import { useHighlightsByUser } from "../../hooks/useHighlight";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { HighlightList } from "./HighlightList";
import { distinctBooks, filterHighlights } from "./highlightUtils";

const PAGE_SIZE = 50;

const EmptyState = () => (
  <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 2, my: 8, bgcolor: "background.paper" }}>
    <MenuBookIcon sx={{ fontSize: 40, mb: 1 }} />
    <div className="font-soft font-bold text-xl mb-1">No quotes yet</div>
    <div className="font-soft mt-2">
      Save lines from your books as you read, from the Record screen — they'll show up here to look back on.
    </div>
  </Paper>
);

/** マイページの「Quotes」タブの中身。自分だけが見られる引用の一覧(このタブは本人にしか表示しない)。 */
export const ProfileHighlights = ({ account }) => {
  const { data: highlights = [], isLoading } = useHighlightsByUser(account.userId);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [bookFilter, setBookFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const books = useMemo(() => distinctBooks(highlights), [highlights]);
  const filtered = useMemo(
    () =>
      filterHighlights(highlights, {
        query: debouncedQuery,
        bookId: bookFilter || undefined,
      }),
    [highlights, debouncedQuery, bookFilter]
  );
  const visible = filtered.slice(0, visibleCount);

  if (isLoading) {
    return null;
  }

  return (
    <div>
      {highlights.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search your quotes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> } }}
            sx={{ flex: 1, minWidth: 180 }}
          />
          {books.length > 0 && (
            <Select
              size="small"
              displayEmpty
              value={bookFilter}
              onChange={(event) => setBookFilter(event.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All books</MenuItem>
              {books.map((book) => (
                <MenuItem key={book.bookId} value={book.bookId}>
                  {book.title}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      )}

      {highlights.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <HighlightList highlights={visible} ownerId={account.userId} groupByBook />
          {filtered.length > visibleCount && (
            <div className="flex justify-center mt-2">
              <button
                type="button"
                className="text-sm underline font-soft text-zinc-600 dark:text-zinc-300"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
