import dayjs from "dayjs";

export const genreToEnum = (genre) => {
  switch (genre) {
    case "Architecture":
      return "ARCHITECTURE";
    case "Art":
      return "ART";
    case "Biography & Autobiography":
      return "BIOGRAPHY_AUTOBIOGRAPHY";
    case "Body, Mind & Spirit":
      return "BODY_MIND_SPIRIT";
    case "Biography & Autobiography":
      return "BIOGRAPHY_AUTOBIOGRAPHY";
    case "Business & Economics":
      return "BUSINESS_ECONOMICS";
    case "Comics & Graphic Novels":
      return "COMICS_GRAPHIC_NOVELS";
    case "Children's stories":
      return "CHILDRENS_STORIES";
    case "Computers":
      return "COMPUTERS";
    case "Cooking":
      return "COOKING";
    case "Crafts & Hobbies":
      return "CRAFTS_HOBBIES";
    case "Design":
      return "DESIGN";
    case "Drama":
      return "DRAMA";
    case "Education":
      return "EDUCATION";
    case "Family & Relationships":
      return "FAMILY_RELATIONSHIPS";
    case "Fiction":
      return "FICTION";
    case "Foreign Language Study":
      return "FOREIGN_LANGUAGE_STUDY";
    case "Health & Fitness":
      return "HEALTH_FITNESS";
    case "History":
      return "HISTORY";
    case "House & Home":
      return "HOUSE_HOME";
    case "Humor":
      return "HUMOR";
    case "Juvenile Fiction":
      return "JUVENILE_FICTION";
    case "Juvenile Nonfiction":
      return "JUVENILE_NONFICTION";
    case "Language Arts & Disciplines":
      return "LANGUAGE_ARTS_DISCIPLINES";
    case "Law":
      return "LAW";
    case "Literary Collections":
      return "LITERARY_COLLECTIONS";
    case "Literary Criticism":
      return "LITERARY_CRITICISM";
    case "Mathematics":
      return "MATHEMATICS";
    case "Medical":
      return "MEDICAL";
    case "Music":
      return "MUSIC";
    case "Nature":
      return "NATURE";
    case "Performing Arts":
      return "PERFORMING_ARTS";
    case "Pets":
      return "PETS";
    case "Philosophy":
      return "PHILOSOPHY";
    case "Photography":
      return "PHOTOGRAPHY";
    case "Poetry":
      return "POETRY";
    case "Political Science":
      return "POLITICAL_SCIENCE";
    case "Psychology":
      return "PSYCHOLOGY";
    case "Reference":
      return "REFERENCE";
    case "Religion":
      return "RELIGION";
    case "Science":
      return "SCIENCE";
    case "Self-Help":
      return "SELF_HELP";
    case "Social Science":
      return "SOCIAL_SCIENCE";
    case "Sports & Recreation":
      return "SPORTS_RECREATION";
    case "Study Aids":
      return "STUDY_AIDS";
    case "Technology & Engineering":
      return "TECHNOLOGY_ENGINEERING";
    case "Transportation":
      return "TRANSPORTATION";
    case "Travel":
      return "TRAVEL";
    case "True Crime":
      return "TRUE_CRIME";
    default:
      return "UNKNOWN";
  }
};

export const generateHandleId = () => {
  const timestamp = Date.now().toString(36); // 現在時刻を36進数で
  const random = Math.random().toString(36).substring(2, 10); // ランダム部分
  return timestamp + random;
};

export const generateFullDateRange = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    dates.push({
      date: current.toISOString().slice(0, 10),
      posts: null,
    });
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const mergeActivityData = (baseDates, activityData) => {
  return baseDates.map((d) => {
    const match = activityData.find((a) => a.date === d.date);
    return match ? match : d;
  });
};

export const isBlank = (str) => {
  return /^\s*$/.test(str);
};

export const formatDateTime = (isoString) => {
  return dayjs(isoString).format("YYYY/MM/DD HH:mm");
};
