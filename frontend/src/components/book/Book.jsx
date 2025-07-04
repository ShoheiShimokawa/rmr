import { Box } from "@mui/material";
import { motion } from "framer-motion";
export const Book = ({ book, onClick, src, width, height }) => {
  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Box
        component="img"
        src={!src ? book?.thumbnail && book?.thumbnail : src}
        sx={{
          width: width ? width : "85px",
          aspectRatio: "85 / 127",
          height: height ? height : "127px",
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
    </motion.div>
  );
};
