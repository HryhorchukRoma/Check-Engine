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

const CheckExchangeSection = ({ checkId = "check-1", onSave, onDelete }) => {
  const [rates, setRates] = useState({
    RON: "",
    EUR: "",
    USD: "",
  });

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
                  onChange={(e) => handleChange("RON", e.target.value)}
                />
              </label>
            </li>

            <li className="check-exchange-section__item">
              <label className="check-exchange-section__field">
                <span>€ EUR</span>

                <input
                  type="text"
                  value={rates.EUR}
                  onChange={(e) => handleChange("EUR", e.target.value)}
                />
              </label>
            </li>

            <li className="check-exchange-section__item">
              <label className="check-exchange-section__field">
                <span>$ USD</span>

                <input
                  type="text"
                  value={rates.USD}
                  onChange={(e) => handleChange("USD", e.target.value)}
                />
              </label>
            </li>

          </ul>
        </div>

        <div className="check-exchange-section__buttons">
          <button
            onClick={onSave}
            className="check-exchange-section__save button button--purple"
          >
            <img src={SaveIcon} alt="save" />
            Зберегти
          </button>

          <button
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