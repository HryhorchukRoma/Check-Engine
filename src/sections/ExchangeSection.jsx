import React, { useEffect, useState } from "react";
import "../styles/sections/exchange-section.scss";
import Icon from "../assets/icons/exchange.svg?react";
import Button from "../components/Button";

const ExchangeSection = () => {
  const [rates, setRates] = useState({
    USD: "",
    EUR: "",
    RON: "",
  });

  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    const saved = localStorage.getItem("exchange-rates");

    if (saved) {
      const parsed = JSON.parse(saved);

      setRates({
        USD: parsed.USD || "",
        EUR: parsed.EUR || "",
        RON: parsed.RON || "",
      });
    }
  }, []);

  const handleChange = (key, value) => {
    setRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveRates = (nextRates) => {
    localStorage.setItem("exchange-rates", JSON.stringify(nextRates));
    window.dispatchEvent(new Event("ratesUpdated"));
  };

  const handleSave = () => {
  setSaveStatus("saving");

  saveRates(rates);

  setTimeout(() => {
    setSaveStatus("saved");
  }, 250);

  setTimeout(() => {
    setSaveStatus("idle");
  }, 1600);
};

  const loadRatesAutomatically = async () => {
    try {
      setIsLoadingRates(true);

      const response = await fetch(
        "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
      );

      if (!response.ok) {
        throw new Error("Не вдалося отримати курси валют.");
      }

      const data = await response.json();

      const findRate = (code) => {
        const item = data.find((rate) => rate.cc === code);
        return item ? String(item.rate.toFixed(2)) : "";
      };

      const nextRates = {
        USD: findRate("USD"),
        EUR: findRate("EUR"),
        RON: findRate("RON"),
      };

      setRates(nextRates);
      saveRates(nextRates);
    } catch (error) {
      console.error("Помилка завантаження курсів:", error);
      alert(error.message || "Не вдалося автоматично завантажити курси валют.");
    } finally {
      setIsLoadingRates(false);
    }
  };

  return (
    <section className="exchange-section">
      <h1 className="exchange-section__title">Керування курсом валют</h1>

      <div className="container">
        <div className="exchange-section__block">
          <span className="exchange-section__label">
            Курси валют
            <Icon className="exchange-section__icon" />
          </span>

          <ul className="exchange-section__list">
            <li className="exchange-section__item">
              <div className="exchange-section__flag">🇺🇸</div>

              <div className="exchange-section__currency">
                <span className="exchange-section__currency-codes">
                  USD <strong>$</strong>
                </span>

                <span className="exchange-section__currency-name">
                  Долар США
                </span>
              </div>

              <div className="exchange-section__input">
                <input
                  value={rates.USD}
                  onChange={(event) => handleChange("USD", event.target.value)}
                  placeholder="USD"
                />
              </div>
            </li>

            <li className="exchange-section__item">
              <div className="exchange-section__flag">🇪🇺</div>

              <div className="exchange-section__currency">
                <span className="exchange-section__currency-codes">
                  EUR <strong>€</strong>
                </span>

                <span className="exchange-section__currency-name">Євро</span>
              </div>

              <div className="exchange-section__input">
                <input
                  value={rates.EUR}
                  onChange={(event) => handleChange("EUR", event.target.value)}
                  placeholder="EUR"
                />
              </div>
            </li>

            <li className="exchange-section__item">
              <div className="exchange-section__flag">🇷🇴</div>

              <div className="exchange-section__currency">
                <span className="exchange-section__currency-codes">
                  RON <strong>lei</strong>
                </span>

                <span className="exchange-section__currency-name">
                  Румунський лей
                </span>
              </div>

              <div className="exchange-section__input">
                <input
                  value={rates.RON}
                  onChange={(event) => handleChange("RON", event.target.value)}
                  placeholder="RON"
                />
              </div>
            </li>
          </ul>
        </div>

        <button
          type="button"
          className="exchange-section__auto"
          onClick={loadRatesAutomatically}
          disabled={isLoadingRates}
        >
          {isLoadingRates ? "Оновлення..." : "Оновити автоматично"}
        </button>

        <Button onClick={handleSave} status={saveStatus} />
      </div>
    </section>
  );
};

export default ExchangeSection;