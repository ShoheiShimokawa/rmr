import { useState } from "react";
import { Badge, Box } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { motion } from "framer-motion";

export const Book = ({ book, onClick, src, width, height, hasDraft }) => {
  const [imageError, setImageError] = useState(false);
  const resolvedSrc = src || book?.thumbnail;
  const boxWidth = width ? width : "85px";
  const boxHeight = height ? height : "127px";

  const image =
    resolvedSrc && !imageError ? (
      <Box
        component="img"
        src={resolvedSrc}
        alt={book?.title || ""}
        sx={{
          width: boxWidth,
          aspectRatio: "85 / 127",
          height: boxHeight,
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
        onError={() => setImageError(true)}
      />
    ) : (
      <Box
        role="img"
        aria-label={book?.title || "No cover"}
        sx={{
          width: boxWidth,
          aspectRatio: "85 / 127",
          height: boxHeight,
          cursor: "pointer",
          boxShadow: 1,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          color: "text.disabled",
          transition: "0.3s ease",
          "&:hover": {
            filter: (theme) =>
              theme.palette.mode === "dark" ? "brightness(1.2)" : "brightness(0.9)",
          },
        }}
        onClick={onClick}
      >
        <MenuBookIcon sx={{ fontSize: "2rem" }} />
      </Box>
    );

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      {hasDraft ? (
        <Badge
          color="warning"
          variant="dot"
          overlap="rectangular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {image}
        </Badge>
      ) : (
        image
      )}
    </motion.div>
  );
};
