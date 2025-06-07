import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import { Chip } from "@mui/material";

export const statusTypeStr = (str) => {
  if (str === "NONE") {
    return "To Read";
  } else if (str === "DOING") {
    return "Reading Now";
  } else if (str === "DONE") {
    return "Completed";
  }
};

export const judgeIcon = (str) => {
  if (str === "NONE") {
    return <BookmarkBorderIcon />;
  } else if (str === "DOING") {
    return <AutoStoriesRoundedIcon />;
  } else {
    return <CheckCircleOutlineRoundedIcon />;
  }
};

// export const judgeGenreIcon=(str)=>{
//     switch(str){
//         case "LITERATURE":
//             return <NaturePeopleRoundedIcon />;
//         case "BUSINESS":
//             return <BusinessCenterRoundedIcon />;
//         case "TECHNICAL":
//             return < />;
//         case "HABIT":
//             return <AccessibilityNewRoundedIcon />;
//         case "REFERENCE":
//             return <SchoolRoundedIcon />
//     }
// }

export const judgeRead = (str) => {
  if (str === "NONE") {
    return "Start reading !";
  } else if (str === "DOING") {
    return "finish!";
  }
};

export const judgePostLabel = (post) => {
  if (post.postType === "ONLY_STAR") {
    return (
      <Chip
        label="Rated!"
        size="small"
        color="success"
        sx={{
          color: "white",
          "& .MuiChip-label": {
            fontSize: "0.70rem",
            fontFamily: "'Nunito sans'",
            fontWeight: "bold",
          },
          "&:hover .MuiChip-label": {
            textDecoration: "none",
            fontFamily: "'Nunito sans'",
            fontWeight: "bold",
          },
        }}
      />
    );
  } else if (post.postType === "WITH_THOUGHTS") {
    return (
      <Chip
        label="Reviewed!"
        size="small"
        color="info"
        sx={{
          color: "white",
          "& .MuiChip-label": {
            fontSize: "0.70rem",
            fontFamily: "'Nunito sans'",
          },
          "&:hover .MuiChip-label": {
            textDecoration: "none",
            fontFamily: "'Nunito sans'",
          },
        }}
      />
    );
  } else if (post.postType === "RECOMMENDED") {
    return (
      <Chip
        label="Recommended!"
        size="small"
        color="warning"
        sx={{
          color: "white",
          "& .MuiChip-label": {
            fontSize: "0.70rem",
            fontFamily: "'Nunito sans'",
          },
          "&:hover .MuiChip-label": {
            textDecoration: "none",
            fontFamily: "'Nunito sans'",
          },
        }}
      />
    );
  }
};
