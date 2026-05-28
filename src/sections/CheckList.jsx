import { useEffect, useMemo, useState } from "react";
import CheckSection from "../sections/CheckSection";
import "../styles/sections/check-list-section.scss";
import { useLocation, Link } from "react-router-dom";

const CheckList = ({ checks = [], showAll }) => {
  const location = useLocation();

  const PAGE_SIZE = 30;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortType, setSortType] = useState("date-new");

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 100) {
        setVisibleCount((prev) =>
          prev >= checks.length ? prev : prev + PAGE_SIZE
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checks.length]);

  const title =
    location.pathname === "/history"
      ? showAll
        ? "Всі чеки"
        : "Сьогодні"
      : "Останні чеки";

  const sortedChecks = useMemo(() => {
    const copied = [...checks];

    switch (sortType) {
      case "date-new":
        return copied.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);

          if (dateDiff !== 0) return dateDiff;

          return (b.time || "00:00").localeCompare(a.time || "00:00");
        });

      case "date-old":
        return copied.sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);

          if (dateDiff !== 0) return dateDiff;

          return (a.time || "00:00").localeCompare(b.time || "00:00");
        });

      case "az":
        return copied.sort((a, b) =>
          (a.shopName || "")
            .trim()
            .toLowerCase()
            .localeCompare((b.shopName || "").trim().toLowerCase(), "uk")
        );

      default:
        return copied;
    }
  }, [checks, sortType]);

  return (
    <section className="check-list-section">
      <div className="container">

        {checks.length === 0 ? (
          <div className="check-list-section__empty-block">
            <img
              className="check-list-section__empty-icon"
              src="/src/assets/icons/empty.svg"
              alt=""
            />
            <p className="check-list-section__empty-text">
              Ще немає збережених чеків
            </p>
          </div>
        ) : (
          <>
            <div className="check-list-section__top">
              <h2 className="check-list-section__title">
                {title}
              </h2>

              <select
                className="check-list-section__filter"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="date-new">Спочатку нові</option>
                <option value="date-old">Спочатку старі</option>
                <option value="az">Від А до Я</option>
              </select>
            </div>

            <ul className="check-list-section__list">
              {sortedChecks.slice(0, visibleCount).map((check) => (
                <li key={check.id} className="check-list-section__item">
                  <Link
                    to={`/history/check/${check.id}`}
                    state={{ check }}
                  >
                    <CheckSection data={check} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

      </div>
    </section>
  );
};

export default CheckList;