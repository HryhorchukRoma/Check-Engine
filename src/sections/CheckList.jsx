import { useEffect, useState } from "react";
import CheckSection from "../sections/CheckSection";
import '../styles/sections/check-list-section.scss';
import { useLocation, Link } from "react-router-dom";

const CheckList = ({ checks = [], showAll }) => {
  const location = useLocation();

  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 100) {
        setVisibleCount((prev) => {
          if (prev >= checks.length) return prev;
          return prev + PAGE_SIZE;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [checks.length]);

  let title = "Останні чеки";
  if (location.pathname === "/history") {
    title = showAll ? "Всі чеки" : "Сьогодні";
  }

  return (
    <section className="check-list-section">
      <div className='container'>

        {checks.length === 0 ? (
          <div className="check-list-section__empty-block">
            <img className="check-list-section__empty-icon" src="/src/assets/icons/empty.svg" alt="" />
            <p className="check-list-section__empty-text">Ще немає збережених чеків</p>
          </div>
        ) : (
          <>
            <h2 className="check-list-section__title">{title}</h2>

            <ul className="check-list-section__list">
              {checks.slice(0, visibleCount).map((check) => (
                <li key={check.id} className="check-list-section__item">
                  <Link to={`/history/check/${check.id}`} state={{ check }}>
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