import { useContext, useMemo, useState } from "react";
import { Box, MenuItem, Paper, Select, TextField } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import UserContext from "../UserProvider";
import { CustomDialog } from "../../ui/CustomDialog";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { useRequireLogin } from "../../hooks/useRequireLogin";
import { useMyHighlights } from "../../hooks/useHighlight";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { StepMemoRegister } from "../StepMemoRegister";
import { HighlightList } from "./HighlightList";
import { distinctBooks, distinctLabels, filterHighlights } from "./highlightUtils";

const PAGE_SIZE = 50;

const EmptyState = ({ onNew }) => (
  <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 2, my: 16, bgcolor: "background.paper" }}>
    <MenuBookIcon sx={{ fontSize: 40, mb: 1 }} />
    <div className="font-soft font-bold text-xl mb-1">No highlights yet</div>
    <div className="font-soft mt-4 mb-2">
      Save the lines that stay with you while you read — they'll show up here to look back on.
    </div>
    <div className="mt-5">
      <PrimaryButton size="small" startIcon={<AddIcon />} onClick={onNew}>
        Save your first highlight
      </PrimaryButton>
    </div>
  </Paper>
);

export const HighlightsPage = () => {
  const { user } = useContext(UserContext);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { data: highlights = [], isLoading } = useMyHighlights();
  const [openRegister, setOpenRegister] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [labelFilter, setLabelFilter] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const labels = useMemo(() => distinctLabels(highlights), [highlights]);
  const books = useMemo(() => distinctBooks(highlights), [highlights]);
  const filtered = useMemo(
    () =>
      filterHighlights(highlights, {
        query: debouncedQuery,
        label: labelFilter || undefined,
        bookId: bookFilter || undefined,
      }),
    [highlights, debouncedQuery, labelFilter, bookFilter]
  );
  const visible = filtered.slice(0, visibleCount);

  const handleOpenRegister = () => {
    if (!isLoggedIn()) return;
    setOpenRegister(true);
  };

  const handleCloseRegister = () => setOpenRegister(false);

  return (
    <div>
      {showLoginDialog && <LoginDialog />}
      <CustomDialog open={openRegister} title="Add Highlight" onClose={handleCloseRegister}>
        <StepMemoRegister updated={handleCloseRegister} />
      </CustomDialog>

      {user && (
        <div className="flex justify-between items-center mt-3 mb-2">
          <div className="font-soft font-bold text-lg">
            Highlights{highlights.length > 0 ? ` (${highlights.length})` : ""}
          </div>
          <PrimaryButton size="small" startIcon={<AddIcon />} onClick={handleOpenRegister}>
            New
          </PrimaryButton>
        </div>
      )}

      {user && highlights.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search your highlights"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> } }}
            sx={{ flex: 1, minWidth: 180 }}
          />
          {labels.length > 0 && (
            <Select
              size="small"
              displayEmpty
              value={labelFilter}
              onChange={(event) => setLabelFilter(event.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All labels</MenuItem>
              {labels.map((label) => (
                <MenuItem key={label.labelId} value={label.name}>
                  {label.name}
                </MenuItem>
              ))}
            </Select>
          )}
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

      {!user || (!isLoading && highlights.length === 0) ? (
        <EmptyState onNew={handleOpenRegister} />
      ) : (
        <>
          <HighlightList highlights={visible} isOwner ownerId={user.userId} />
          {filtered.length > visibleCount && (
            <div className="flex justify-center mt-2">
              <PrimaryButton size="small" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Show more
              </PrimaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};
