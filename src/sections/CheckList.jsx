import { useEffect, useMemo, useState } from "react";
import CheckSection from "../sections/CheckSection";
import SelectMenu from "../components/SelectMenu";
import "../styles/sections/check-list-section.scss";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { receiptService } from "../services/checkEngineService.js";


const CheckList = ({ checks = [], showAll }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const PAGE_SIZE = 30;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortType, setSortType] = useState("date-new");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (!openMenuId) return;

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

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

  const getCheckDate = (check) => {
    return check.purchased_at || check.created_at || check.date || "";
  };

  const visibleChecks = useMemo(() => {
    return checks.filter((check) => !deletedIds.includes(check.id));
  }, [checks, deletedIds]);

  const sortedChecks = useMemo(() => {
    const copied = [...visibleChecks];

    switch (sortType) {
      case "date-new":
        return copied.sort((a, b) => {
          return new Date(getCheckDate(b)) - new Date(getCheckDate(a));
        });

      case "date-old":
        return copied.sort((a, b) => {
          return new Date(getCheckDate(a)) - new Date(getCheckDate(b));
        });

      case "az":
        return copied.sort((a, b) =>
          (a.store_name || a.shopName || "")
            .trim()
            .toLowerCase()
            .localeCompare(
              (b.store_name || b.shopName || "").trim().toLowerCase(),
              "uk"
            )
        );

      default:
        return copied;
    }
  }, [visibleChecks, sortType]);

  const handleToggleMenu = (event, checkId) => {
    event.preventDefault();
    event.stopPropagation();

    setOpenMenuId((prev) => (prev === checkId ? null : checkId));
  };

  const handleEdit = (check) => {
    setOpenMenuId(null);
    navigate(`/history/check/${check.id}`, { state: { check } });
  };

  const handleDeleteClick = (check) => {
    setOpenMenuId(null);
    setDeleteCandidate(check);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;

    const checkId = deleteCandidate.id;

    try {
      setDeletedIds((prev) => [...prev, checkId]);
      setDeleteCandidate(null);

      await receiptService.deleteReceipt(checkId);
    } catch (error) {
      console.error("Помилка видалення чеку:", error);
      setDeletedIds((prev) => prev.filter((id) => id !== checkId));
      alert(error.message || "Не вдалося видалити чек.");
    }
  };
  const sortOptions = [
  { value: "date-new", label: "Спочатку нові" },
  { value: "date-old", label: "Спочатку старі" },
  { value: "az", label: "Від А до Я" },
];
  return (
    <section className="check-list-section">
      <div className="container">
        {visibleChecks.length === 0 ? (
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
              <h2 className="check-list-section__title">{title}</h2>

              <div className="check-list-section__filter">
                <SelectMenu
                  value={sortType}
                  options={sortOptions}
                  onChange={setSortType}
                />
            </div>
            </div>

            <ul className="check-list-section__list">
              {sortedChecks.slice(0, visibleCount).map((check) => (
                <li
                  key={check.id}
                  className={`check-list-section__item ${
                    openMenuId === check.id ? "menu-open" : ""
                  }`}
                >
                  <div className="check-list-section__row">
                    <div className="check-list-section__actions">
                      <button
                        type="button"
                        className="check-list-section__dots"
                        onClick={(event) =>
                          handleToggleMenu(event, check.id)
                        }
                        aria-label="Дії з чеком"
                      >
                        <span />
                        <span />
                        <span />
                      </button>

                      {openMenuId === check.id && (
                        <div
                          className="check-list-section__menu"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="check-list-section__menu-item"
                            onClick={() => handleEdit(check)}
                          >
                            Редагувати
                          </button>

                          <button
                            type="button"
                            className="check-list-section__menu-item check-list-section__menu-item--danger"
                            onClick={() => handleDeleteClick(check)}
                          >
                            Видалити
                          </button>
                        </div>
                      )}
                    </div>

                    <Link
                      className="check-list-section__link"
                      to={`/history/check/${check.id}`}
                      state={{ check }}
                    >
                      <CheckSection data={check} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {deleteCandidate && (
        <div className="check-list-section__modal-overlay">
          <div className="check-list-section__modal">
            <h3 className="check-list-section__modal-title">
              Видалити чек?
            </h3>

            <p className="check-list-section__modal-text">
              Цю дію неможливо скасувати.
            </p>

            <div className="check-list-section__modal-actions">
              <button
                type="button"
                className="check-list-section__modal-cancel"
                onClick={() => setDeleteCandidate(null)}
              >
                Скасувати
              </button>

              <button
                type="button"
                className="check-list-section__modal-delete"
                onClick={confirmDelete}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckList;