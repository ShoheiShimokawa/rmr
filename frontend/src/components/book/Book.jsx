import { Box } from "@mui/material";
export const Book = ({ book, onClick, src }) => {
  return (
    <Box
      component="img"
      src={!src ? book.thumbnail : src}
      sx={{
        width: "95px",
        height: "130px",
        cursor: "pointer",
        boxShadow: 1,
        borderRadius: 1,
        objectFit: "cover",
        transition: "0.3s ease",
        "&:hover": {
          filter: "brightness(0.9)",
        },
      }}
      onClick={onClick}
    />
  );
};
