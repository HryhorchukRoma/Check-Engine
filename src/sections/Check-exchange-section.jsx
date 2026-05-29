import { useEffect, useState } from "react";
import "../styles/sections/check-exchange-section.scss";

import SaveIcon from "../assets/icons/save.svg";
import DeleteIcon from "../assets/icons/delete.svg";

const getRates = (checkId) => {
  const globalRates = JSON.parse(localStorage.getItem("exchange-rates") || "{}");
  const allChecks = JSON.parse(localStorage.getItem("check-rates") || "{}");

  const checkRates = allChecks[checkId] || {};

  return {
    RON: checkRates.RON ?? globalRates.RON ?? "",
    EUR: checkRates.EUR ?? globalRates.EUR ?? "",
    USD: checkRates.USD ?? globalRates.USD ?? "",
  };
};

const CheckExchangeSection = ({
  checkId = "check-1",
  onSave,
  onDelete,
  onExport,
}) => {
  const [rates, setRates] = useState({
    RON: "",
    EUR: "",
    USD: "",
  });

  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    setRates(getRates(checkId));
  }, [checkId]);

  const handleChange = (key, value) => {
    setRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const allChecks = JSON.parse(localStorage.getItem("check-rates") || "{}");

    allChecks[checkId] = rates;

    localStorage.setItem("check-rates", JSON.stringify(allChecks));
  };

  const handleDelete = () => {
    const allChecks = JSON.parse(localStorage.getItem("check-rates") || "{}");

    delete allChecks[checkId];

    localStorage.setItem("check-rates", JSON.stringify(allChecks));

    onDelete?.();
  };

  return (
    <section className="check-exchange-section">
      <div className="container">
        <div className="check-exchange-section__block">
          <h2 className="check-exchange-section__title">
            Курси валют
          </h2>

          <ul className="check-exchange-section__list">
            <li className="check-exchange-section__item">
              <label className="check-exchange-section__field">
                <span>lei RON</span>

                <input
                  type="text"
                  value={rates.RON}
                  onChange={(event) => handleChange("RON", event.target.value)}
                />
              </label>
            </li>

            <li className="check-exchange-section__item">
              <label className="check-exchange-section__field">
                <span>€ EUR</span>

                <input
                  type="text"
                  value={rates.EUR}
                  onChange={(event) => handleChange("EUR", event.target.value)}
                />
              </label>
            </li>

            <li className="check-exchange-section__item">
              <label className="check-exchange-section__field">
                <span>$ USD</span>

                <input
                  type="text"
                  value={rates.USD}
                  onChange={(event) => handleChange("USD", event.target.value)}
                />
              </label>
            </li>
          </ul>
        </div>

        <div className="check-exchange-section__buttons">
          <button
            type="button"
            onClick={onSave}
            className="check-exchange-section__save button button--purple"
          >
            <img src={SaveIcon} alt="save" />
            Зберегти
          </button>

          <div className="check-exchange-section__export-wrap">
            <button
              type="button"
              className="check-exchange-section__export button button--purple"
              onClick={() => setIsExportOpen((prev) => !prev)}
            >
              Excel
            </button>

            {isExportOpen && (
              <div className="check-exchange-section__export-menu">
                <button
                  type="button"
                  onClick={() => {
                    onExport?.("full");
                    setIsExportOpen(false);
                  }}
                >
                  Вся інформація
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExport?.("items");
                    setIsExportOpen(false);
                  }}
                >
                  Лише товари
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="check-exchange-section__delete button button--red"
          >
            <img src={DeleteIcon} alt="delete" />
            Видалити
          </button>
        </div>
      </div>
    </section>
  );
};

export default CheckExchangeSection;