import { useState } from "react";
import { Button } from "@mui/material";

export const CollapsibleText = ({ text, maxLength = 150, maxNewlines = 6 }) => {
  const [expanded, setExpanded] = useState(false);

  const lineCount = text && text.split("\n").length;
  const isTooManyNewlines = lineCount > maxNewlines;
  const isTooLong = text && text.length > maxLength;

  const shouldCollapse = !expanded && (isTooLong || isTooManyNewlines);

  const displayText = shouldCollapse
    ? text.split("\n").slice(0, maxNewlines).join("\n").slice(0, maxLength) +
      "…"
    : text;

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all w-full max-w-full overflow-hidden">
      <div>{displayText}</div>
      {(isTooLong || isTooManyNewlines) && (
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
