import { format } from "date-fns";

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

export const enumToGenre = (genre) => {
  switch (genre) {
    case "ARCHITECTURE":
      return "Architecture";
    case "ART":
      return "Art";
    case "BIOGRAPHY_AUTOBIOGRAPHY":
      return "Biography & Autobiography";
    case "BODY_MIND_SPIRIT":
      return "Body, Mind & Spirit";
    case "BUSINESS_ECONOMICS":
      return "Business & Economics";
    case "COMICS_GRAPHIC_NOVELS":
      return "Comics & Graphic Novels";
    case "CHILDRENS_STORIES":
      return "Children's stories";
    case "COMPUTERS":
      return "Computers";
    case "COOKING":
      return "Cooking";
    case "CRAFTS_HOBBIES":
      return "Crafts & Hobbies";
    case "DESIGN":
      return "Design";
    case "DRAMA":
      return "Drama";
    case "EDUCATION":
      return "Education";
    case "FAMILY_RELATIONSHIPS":
      return "Family & Relationships";
    case "FICTION":
      return "Fiction";
    case "FOREIGN_LANGUAGE_STUDY":
      return "Foreign Language Study";
    case "HEALTH_FITNESS":
      return "Health & Fitness";
    case "HISTORY":
      return "History";
    case "HOUSE_HOME":
      return "House & Home";
    case "HUMOR":
      return "Humor";
    case "JUVENILE_FICTION":
      return "Juvenile Fiction";
    case "JUVENILE_NONFICTION":
      return "Juvenile Nonfiction";
    case "LANGUAGE_ARTS_DISCIPLINES":
      return "Language Arts & Disciplines";
    case "LAW":
      return "Law";
    case "LITERARY_COLLECTIONS":
      return "Literary Collections";
    case "LITERARY_CRITICISM":
      return "Literary Criticism";
    case "MATHEMATICS":
      return "Mathematics";
    case "MEDICAL":
      return "Medical";
    case "MUSIC":
      return "Music";
    case "NATURE":
      return "Nature";
    case "PERFORMING_ARTS":
      return "Performing Arts";
    case "PETS":
      return "Pets";
    case "PHILOSOPHY":
      return "Philosophy";
    case "PHOTOGRAPHY":
      return "Photography";
    case "POETRY":
      return "Poetry";
    case "POLITICAL_SCIENCE":
      return "Political Science";
    case "PSYCHOLOGY":
      return "Psychology";
    case "REFERENCE":
      return "Reference";
    case "RELIGION":
      return "Religion";
    case "SCIENCE":
      return "Science";
    case "SELF_HELP":
      return "Self-Help";
    case "SOCIAL_SCIENCE":
      return "Social Science";
    case "SPORTS_RECREATION":
      return "Sports & Recreation";
    case "STUDY_AIDS":
      return "Study Aids";
    case "TECHNOLOGY_ENGINEERING":
      return "Technology & Engineering";
    case "TRANSPORTATION":
      return "Transportation";
    case "TRAVEL":
      return "Travel";
    case "TRUE_CRIME":
      return "True Crime";
    default:
      return "Unknown";
  }
};

export const toLargeGenre = (genre) => {
  switch (genre) {
    case "FICTION":
      return "Fiction";
    case "NON_FICTION":
      return "Non Fiction";
    case "PROFESSIONAL_TECHNICAL":
      return "Professional & Technical";
    case "ARTS_CULTURE":
      return "Arts & Culture";
    case "EDUCATION_STUDYAIDS":
      return "Education & Study aids";
    case "ENTERTAINMENT":
      return "Entertainment";
    case "ACADEMICS_RESEARCH":
      return "Academics & Research";
    case "PRACTICAL_HOBBIES":
      return "Practical & Hobbies";
    case "OTHER":
      return "Other";
    default:
      return "Unknown";
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

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return format(date, "yyyy/MM/dd HH:mm");
};
