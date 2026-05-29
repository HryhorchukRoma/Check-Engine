import "../styles/sections/check-hero-section.scss";
import { useNavigate } from "react-router-dom";

const CheckHeroSection = ({ check }) => {
  const navigate = useNavigate();

  if (!check) return null;

  const purchasedAt = check.purchased_at || check.date;
  const date = purchasedAt ? new Date(purchasedAt) : null;
  const hasValidDate = date && !Number.isNaN(date.getTime());

  const formattedDate = hasValidDate
    ? date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Дата невідома";

  const formattedTime = hasValidDate
    ? date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <section className="check-hero-section">
      <h1 className="check-hero-section__title">
        <span
          className="check-hero-section__icon-wrap"
          onClick={() => navigate("/history")}
        >
          <img src="/src/assets/images/back.png" alt="back" />
        </span>

        Зберегти чек
      </h1>

      <div className="container">
        <div className="check-hero-section__info">
          <img
            className="check-hero-section__icon"
            src="/src/assets/icons/shop-icon.svg"
            alt="shop"
          />

          <div className="check-hero-section__block">
            <h2 className="check-hero-section__name">
              {check.store_name || check.shopName || "Магазин не вказано"}
            </h2>

            <p className="check-hero-section__address">
              <img
                className="check-section__icon"
                src="/src/assets/icons/address.svg"
                alt=""
              />

              {check.store_address || check.address || "Адреса не вказана"}
            </p>

            <span className="check-hero-section__date">
              <img
                className="check-section__icon"
                src="/src/assets/icons/date.svg"
                alt=""
              />

              {formattedDate}

              {formattedTime && (
                <strong className="check-hero-section__time">
                  <img
                    className="check-section__icon"
                    src="/src/assets/icons/time.svg"
                    alt=""
                  />

                  {formattedTime}
                </strong>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckHeroSection;