import '../styles/sections/check-hero-section.scss';
import { useNavigate } from "react-router-dom";

const CheckHeroSection = ({ check }) => {
  const navigate = useNavigate();

  if (!check) return null;

  return (
    <section className="check-hero-section">

      <h1 className='check-hero-section__title'>
        <span
          className="check-hero-section__icon-wrap"
          onClick={() => navigate("/history")}
        >
          <img src="/src/assets/images/back.png" alt="back" />
        </span>

        Зберегти чек
      </h1>

      <div className='container'>
        <div className='check-hero-section__info'>

          <img
            className='check-hero-section__icon'
            src="/src/assets/icons/shop-icon.svg"
            alt="shop"
          />

          <div className='check-hero-section__block'>

            <h2 className='check-hero-section__name'>
              {check.shopName}
            </h2>

            <p className='check-hero-section__address'>
              <img
                className='check-section__icon'
                src="/src/assets/icons/address.svg"
                alt=""
              />
              {check.address}
            </p>

            <span className='check-hero-section__date'>

              <img
                className='check-section__icon'
                src="/src/assets/icons/date.svg"
                alt=""
              />

              {check.date}

              <strong className='check-hero-section__time'>
                <img
                  className='check-section__icon'
                  src="/src/assets/icons/time.svg"
                  alt=""
                />
                {check.time}
              </strong>

            </span>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckHeroSection;