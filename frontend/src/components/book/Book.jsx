import { Box } from "@mui/material";
export const Book = ({ book, onClick }) => {
  return (
    <Box
      component="img"
      src={book.thumbnail}
      sx={{
        width: "100px",
        height: "150px",
        cursor: "pointer",
        boxShadow: 1,
        borderRadius: 2,
        objectFit: "cover", // はみ出したらいい感じにトリミングする
        transition: "0.3s ease",
        "&:hover": {
          filter: "brightness(0.8)",
        },
      }}
      onClick={onClick}
    />
  );
};
