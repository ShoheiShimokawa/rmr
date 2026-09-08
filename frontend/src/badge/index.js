import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Chip } from "@mui/material";

// tはコンポーネント側でuseTranslation()から取得したものを渡す
// (このファイルはコンポーネントではないのでフックを直接呼べないため)
export const statusTypeStr = (t, str) => {
  if (str === "NONE") {
    return t("badge.status.none");
  } else if (str === "DOING") {
    return t("badge.status.doing");
  } else if (str === "DONE") {
    return t("badge.status.done");
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

export const judgePostLabel = (t, post) => {
  if (post.postType === "ONLY_STAR") {
    return (
      <Chip
        label={t("badge.post.rated")}
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
        label={t("badge.post.reviewed")}
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
        label={t("badge.post.recommended")}
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
