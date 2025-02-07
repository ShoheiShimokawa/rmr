import NaturePeopleRoundedIcon from '@mui/icons-material/NaturePeopleRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';

export const statusTypeStr = (str) => {
    if (str === "NONE") {
        return "Not yet"
    }
    else if (str === "DOING") {
        return "In Progress"
    }
    else if (str === "DONE") {
        return "Conquered"
    }
}

export const judgeIcon = (str) => {
    if (str === "NONE") {
        return <FiberNewRoundedIcon />
    } else if (str === ("DOING")) {
        return <AutoStoriesRoundedIcon />
    } else {
        return <CheckCircleOutlineRoundedIcon />
    }
}

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
    if (str === ("NONE")) {
        return "Start reading !"
    }
    else if (str === ("DOING")) {
        return "finish!"
    }
}
export const judgeRate = (str) => {
    if (str === ("ONE")) {
        return <StarRateRoundedIcon fontSize='2' />
    }
    else if (str === ("TWO")) {
        return <span><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /></span>
    }
    else if (str === ("THREE")) {
        return <span><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /></span>
    } else if (str === ("FOUR")) {
        return <span><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /></span>
    } else if (str === ("FIVE")) {
        return <span><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /><StarRateRoundedIcon fontSize='2' /></span>
    }
}