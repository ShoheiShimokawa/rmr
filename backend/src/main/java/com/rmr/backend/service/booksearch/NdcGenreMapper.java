package com.rmr.backend.service.booksearch;

import java.util.EnumMap;
import java.util.Map;

import com.rmr.backend.type.GenreType;

/**
 * 日本十進分類法(NDC)の分類記号を、アプリのジャンル体系に対応づける。
 * 返すラベルはフロントエンドの genreToEnum が解釈する表記(例: "Business & Economics")。
 */
public final class NdcGenreMapper {

    private static final Map<GenreType, String> LABELS = new EnumMap<>(GenreType.class);

    static {
        LABELS.put(GenreType.ARCHITECTURE, "Architecture");
        LABELS.put(GenreType.ART, "Art");
        LABELS.put(GenreType.BIOGRAPHY_AUTOBIOGRAPHY, "Biography & Autobiography");
        LABELS.put(GenreType.BUSINESS_ECONOMICS, "Business & Economics");
        LABELS.put(GenreType.COMICS_GRAPHIC_NOVELS, "Comics & Graphic Novels");
        LABELS.put(GenreType.COMPUTERS, "Computers");
        LABELS.put(GenreType.COOKING, "Cooking");
        LABELS.put(GenreType.CRAFTS_HOBBIES, "Crafts & Hobbies");
        LABELS.put(GenreType.DESIGN, "Design");
        LABELS.put(GenreType.DRAMA, "Drama");
        LABELS.put(GenreType.EDUCATION, "Education");
        LABELS.put(GenreType.FICTION, "Fiction");
        LABELS.put(GenreType.FOREIGN_LANGUAGE_STUDY, "Foreign Language Study");
        LABELS.put(GenreType.HEALTH_FITNESS, "Health & Fitness");
        LABELS.put(GenreType.HISTORY, "History");
        LABELS.put(GenreType.HOUSE_HOME, "House & Home");
        LABELS.put(GenreType.JUVENILE_FICTION, "Juvenile Fiction");
        LABELS.put(GenreType.JUVENILE_NONFICTION, "Juvenile Nonfiction");
        LABELS.put(GenreType.LANGUAGE_ARTS_DISCIPLINES, "Language Arts & Disciplines");
        LABELS.put(GenreType.LAW, "Law");
        LABELS.put(GenreType.LITERARY_COLLECTIONS, "Literary Collections");
        LABELS.put(GenreType.LITERARY_CRITICISM, "Literary Criticism");
        LABELS.put(GenreType.MATHEMATICS, "Mathematics");
        LABELS.put(GenreType.MEDICAL, "Medical");
        LABELS.put(GenreType.MUSIC, "Music");
        LABELS.put(GenreType.PERFORMING_ARTS, "Performing Arts");
        LABELS.put(GenreType.PETS, "Pets");
        LABELS.put(GenreType.PHILOSOPHY, "Philosophy");
        LABELS.put(GenreType.PHOTOGRAPHY, "Photography");
        LABELS.put(GenreType.POETRY, "Poetry");
        LABELS.put(GenreType.POLITICAL_SCIENCE, "Political Science");
        LABELS.put(GenreType.PSYCHOLOGY, "Psychology");
        LABELS.put(GenreType.REFERENCE, "Reference");
        LABELS.put(GenreType.RELIGION, "Religion");
        LABELS.put(GenreType.SCIENCE, "Science");
        LABELS.put(GenreType.SELF_HELP, "Self-Help");
        LABELS.put(GenreType.SOCIAL_SCIENCE, "Social Science");
        LABELS.put(GenreType.SPORTS_RECREATION, "Sports & Recreation");
        LABELS.put(GenreType.TECHNOLOGY_ENGINEERING, "Technology & Engineering");
        LABELS.put(GenreType.TRANSPORTATION, "Transportation");
        LABELS.put(GenreType.TRAVEL, "Travel");
    }

    private NdcGenreMapper() {
    }

    /** NDC分類記号(例: "332.107", "913.6", "K913")からジャンルラベルを返す。判定できない場合はnull。 */
    public static String toGenreLabel(String ndc) {
        GenreType genre = toGenreType(ndc);
        return genre == null ? null : LABELS.get(genre);
    }

    static GenreType toGenreType(String ndc) {
        if (ndc == null) {
            return null;
        }
        String code = ndc.trim().toUpperCase();
        boolean juvenile = code.startsWith("K");
        if (juvenile) {
            code = code.substring(1);
        }
        String digits = code.replaceAll("[^0-9]", "");
        if (digits.length() < 3) {
            return null;
        }
        if (juvenile) {
            return digits.charAt(0) == '9' ? GenreType.JUVENILE_FICTION : GenreType.JUVENILE_NONFICTION;
        }
        String top3 = digits.substring(0, 3);
        String top2 = digits.substring(0, 2);
        return switch (digits.charAt(0)) {
            case '0' -> top3.equals("007") ? GenreType.COMPUTERS : GenreType.REFERENCE;
            case '1' -> philosophy(top2, top3);
            case '2' -> switch (top2) {
                case "28" -> GenreType.BIOGRAPHY_AUTOBIOGRAPHY;
                case "29" -> GenreType.TRAVEL;
                default -> GenreType.HISTORY;
            };
            case '3' -> socialScience(top2);
            case '4' -> switch (top2) {
                case "41" -> GenreType.MATHEMATICS;
                case "49" -> top3.equals("498") ? GenreType.HEALTH_FITNESS : GenreType.MEDICAL;
                default -> GenreType.SCIENCE;
            };
            case '5' -> technology(top2, top3);
            case '6' -> switch (top2) {
                case "68" -> GenreType.TRANSPORTATION;
                default -> top3.equals("645") ? GenreType.PETS : GenreType.BUSINESS_ECONOMICS;
            };
            case '7' -> arts(top2, top3);
            case '8' -> top2.equals("81") || top2.equals("80")
                    ? GenreType.LANGUAGE_ARTS_DISCIPLINES
                    : GenreType.FOREIGN_LANGUAGE_STUDY;
            case '9' -> literature(digits);
            default -> null;
        };
    }

    private static GenreType philosophy(String top2, String top3) {
        if (top3.equals("159")) {
            return GenreType.SELF_HELP;
        }
        return switch (top2) {
            case "14" -> GenreType.PSYCHOLOGY;
            case "16", "17", "18", "19" -> GenreType.RELIGION;
            default -> GenreType.PHILOSOPHY;
        };
    }

    private static GenreType socialScience(String top2) {
        return switch (top2) {
            case "31", "39" -> GenreType.POLITICAL_SCIENCE;
            case "32" -> GenreType.LAW;
            case "33" -> GenreType.BUSINESS_ECONOMICS;
            case "37" -> GenreType.EDUCATION;
            default -> GenreType.SOCIAL_SCIENCE;
        };
    }

    private static GenreType technology(String top2, String top3) {
        return switch (top2) {
            case "52" -> GenreType.ARCHITECTURE;
            case "54" -> top3.equals("548") ? GenreType.COMPUTERS : GenreType.TECHNOLOGY_ENGINEERING;
            case "59" -> top3.equals("596") ? GenreType.COOKING : GenreType.HOUSE_HOME;
            default -> GenreType.TECHNOLOGY_ENGINEERING;
        };
    }

    private static GenreType arts(String top2, String top3) {
        return switch (top2) {
            case "72" -> top3.equals("726") ? GenreType.COMICS_GRAPHIC_NOVELS : GenreType.ART;
            case "74" -> GenreType.PHOTOGRAPHY;
            case "75" -> top3.equals("757") ? GenreType.DESIGN : GenreType.CRAFTS_HOBBIES;
            case "76" -> GenreType.MUSIC;
            case "77" -> GenreType.PERFORMING_ARTS;
            case "78" -> GenreType.SPORTS_RECREATION;
            case "79" -> GenreType.CRAFTS_HOBBIES;
            default -> GenreType.ART;
        };
    }

    /** 9xy の y(文学形式): 1=詩歌, 2=戯曲, 3=小説, 4〜8=評論・随筆・記録・作品集, 0/9=総記・文学史。 */
    private static GenreType literature(String digits) {
        return switch (digits.charAt(2)) {
            case '1' -> GenreType.POETRY;
            case '2' -> GenreType.DRAMA;
            case '3' -> GenreType.FICTION;
            case '4', '5', '6', '7', '8' -> GenreType.LITERARY_COLLECTIONS;
            default -> GenreType.LITERARY_CRITICISM;
        };
    }
}
