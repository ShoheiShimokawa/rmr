import { Divider } from "@mui/material";
import { Box } from "@mui/material";
import { statusTypeStr } from "../badge";
import Chip from "@mui/material/Chip";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

export const BookDetail = ({ book, reading }) => {
  const judgeIcon = (str) => {
    if (str === "NONE") {
      return <FiberNewRoundedIcon />;
    } else if (str === "DOING") {
      return <AutoStoriesRoundedIcon />;
    } else {
      return <CheckCircleOutlineRoundedIcon />;
    }
  };
  return (
    <div className="flex">
      <div>
        {book && (
          <>
            <div className="flex">
              <Box
                component="img"
                src={book.thumbnail}
                sx={{ width: "100", height: "100" }}
              />
              <div>
                <div className="text-xl"> {book.title}</div>
                <div className="text-zinc-500">
                  {book.author && book.author}
                </div>
                <Chip
                  label={book.genre}
                  sx={{
                    "&:hover .MuiChip-label": {
                      textDecoration: "none",
                    },
                  }}
                />

                <div>
                  Published{" "}
                  {book.publishedDate ? book.publishedDate : "unknown"}
                </div>
                {reading && (
                  <Chip
                    icon={judgeIcon(reading.statusType)}
                    label={statusTypeStr(reading.statusType)}
                    size="small"
                  ></Chip>
                )}
              </div>
            </div>

            <div className="text-base font-sans">{book.description}</div>
          </>
        )}
      </div>
    </div>
  );
};
