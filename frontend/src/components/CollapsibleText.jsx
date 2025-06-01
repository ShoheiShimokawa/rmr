import { useState } from "react";
import { Button } from "@mui/material";

export const CollapsibleText = ({ text, maxLength = 150 }) => {
  const [expanded, setExpanded] = useState(false);

  const isLong = text && text.length > maxLength;
  const displayText =
    !isLong || expanded ? text : text.slice(0, maxLength) + "…";

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      <p>{displayText}</p>
      {isLong && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{
            padding: 0,
            minWidth: "auto",
            textTransform: "none",
            fontSize: "0.85rem",
            fontWeight: "bold",
          }}
          className="text-blue-600 hover:underline mt-1"
        >
          {expanded ? "Close" : "Show all"}
        </Button>
      )}
    </div>
  );
};
