import { Tabs, Tab } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { BsChatSquareQuote, BsChatSquareQuoteFill } from "react-icons/bs";

const tabSx = {
  textTransform: "none",
  fontWeight: "bold",
  fontFamily: "'Nunito sans'",
  fontSize: 13,
  minHeight: 36,
  minWidth: 0,
  py: 0.5,
  px: 1.5,
};

/**
 * Record画面の Review(自分の言葉) / Quotes(本の言葉) 切り替え。内部の状態値は
 * review/highlight のまま、表示ラベルのみ Review/Quotes。
 */
export const RecordModeToggle = ({ value, onChange, quoteCount = 0 }) => (
  <Tabs
    value={value}
    onChange={(event, newValue) => onChange(newValue)}
    textColor="inherit"
    TabIndicatorProps={{ style: { backgroundColor: "currentColor" } }}
    sx={{ minHeight: 36 }}
  >
    <Tab
      value="review"
      icon={
        value === "review" ? (
          <DescriptionRoundedIcon sx={{ fontSize: 15 }} />
        ) : (
          <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />
        )
      }
      iconPosition="start"
      label="Review"
      sx={tabSx}
    />
    <Tab
      value="highlight"
      icon={value === "highlight" ? <BsChatSquareQuoteFill size={13} /> : <BsChatSquareQuote size={13} />}
      iconPosition="start"
      label={quoteCount > 0 ? `Quotes (${quoteCount})` : "Quotes"}
      sx={tabSx}
    />
  </Tabs>
);
