import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";

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
    return <FiberNewRoundedIcon />;
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
export const judgeRate = (str) => {
  if (str === "ONE") {
    return <StarRateRoundedIcon fontSize="2" />;
  } else if (str === "TWO") {
    return (
      <span>
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
      </span>
    );
  } else if (str === "THREE") {
    return (
      <span>
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
      </span>
    );
  } else if (str === "FOUR") {
    return (
      <span>
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
      </span>
    );
  } else if (str === "FIVE") {
    return (
      <span>
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
        <StarRateRoundedIcon fontSize="2" />
      </span>
    );
  }
};
