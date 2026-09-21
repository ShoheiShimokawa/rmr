import { useContext } from "react";
import UserContext from "../UserProvider";
import { useAnalytics } from "../../hooks/useReading";
import { GenrePieChart } from "./GenrePieChart";
import { MonthlyVolumeChart } from "./MonthlyVolumeChart";
import { YearlyTrendChart } from "./YearlyTrendChart";
import { TopAuthorsChart } from "./TopAuthorsChart";
import { DeltaBadge } from "./DeltaBadge";
import { StatHeader } from "./StatHeader";
import { monthlyDelta, yearlyDelta } from "./transform";

const SectionCard = ({ title, children }) => (
  <div className="card bg-base-100 shadow-md rounded-2xl">
    <div className="card-body p-3">
      <div className="font-soft text-lg font-bold mb-1.5">{title}</div>
      {children}
    </div>
  </div>
);

const booksUnit = (count) => (count === 1 ? "book" : "books");

export const ReadingAnalytics = () => {
  const { user } = useContext(UserContext);
  const { data: analytics, isLoading } = useAnalytics(user?.userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[250px]">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-zinc-500 dark:text-zinc-400">
        No data.
      </div>
    );
  }

  const monthDelta = monthlyDelta(analytics.monthly);
  const yearDelta = yearlyDelta(analytics.yearly);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionCard title="Monthly Reading Volume">
        <StatHeader
          label={monthDelta.month.replace("-", "/")}
          value={monthDelta.current}
          unit={booksUnit(monthDelta.current)}
          delta={<DeltaBadge current={monthDelta.current} previous={monthDelta.previous} />}
        />
        <MonthlyVolumeChart monthly={analytics.monthly} yearly={analytics.yearly} />
      </SectionCard>
      <SectionCard title="Your Reading by Genre">
        <GenrePieChart genres={analytics.genres} />
      </SectionCard>
      <SectionCard title="Yearly Trend">
        {yearDelta && (
          <StatHeader
            label={String(yearDelta.year)}
            value={yearDelta.current}
            unit={booksUnit(yearDelta.current)}
            delta={<DeltaBadge current={yearDelta.current} previous={yearDelta.previous} />}
          />
        )}
        <YearlyTrendChart yearly={analytics.yearly} />
      </SectionCard>
      <SectionCard title="Top Authors">
        <TopAuthorsChart topAuthors={analytics.topAuthors} />
      </SectionCard>
    </div>
  );
};
