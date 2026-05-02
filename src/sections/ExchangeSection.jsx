import React, { useEffect, useState } from 'react';
import '../styles/sections/exchange-section.scss';
import Icon from '../assets/icons/exchange.svg?react';
import Button from '../components/Button';

const ExchangeSection = () => {

    const [rates, setRates] = useState({
        UAH: '',
        USD: '',
        EUR: '',
        RON: '',
    });

    useEffect(() => {
        const saved = localStorage.getItem('exchange-rates');
        if (saved) {
            setRates(JSON.parse(saved));
        }
    }, []);


    const handleChange = (key, value) => {
        setRates(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    // 🔹 збереження
    const handleSave = () => {
        localStorage.setItem('exchange-rates', JSON.stringify(rates));
        window.dispatchEvent(new Event("ratesUpdated"));
    };

    return (
        <section className='exchange-section'>
            <h1 className='exchange-section__title'>Керування курсом валют</h1>

            <div className='container'>
                <div className='exchange-section__block'>
                    <span className='exchange-section__label'>
                        Курси валют
                        <Icon className='exchange-section__icon' />
                    </span>

                    <ul className='exchange-section__list'>

                        {/* UAH */}
                        <li className='exchange-section__item'>
                            <div className='exchange-section__flag'>🇺🇦</div>
                            <div className='exchange-section__currency'>
                                <span className='exchange-section__currency-codes'>UAH <strong>₴</strong></span>
                                <span className='exchange-section__currency-name'>Гривня</span>
                            </div>
                            <div className="exchange-section__input">
                                <input
                                    value={rates.UAH}
                                    onChange={(e) => handleChange('UAH', e.target.value)}
                                    placeholder="UAH"
                                />
                            </div>
                        </li>

                        {/* USD */}
                        <li className='exchange-section__item'>
                            <div className='exchange-section__flag'>🇺🇸</div>
                            <div className='exchange-section__currency'>
                                <span className='exchange-section__currency-codes'>USD <strong>$</strong></span>
                                <span className='exchange-section__currency-name'>Долар США</span>
                            </div>
                            <div className="exchange-section__input">
                                <input
                                    value={rates.USD}
                                    onChange={(e) => handleChange('USD', e.target.value)}
                                    placeholder="USD"
                                />
                            </div>
                        </li>

                        {/* EUR */}
                        <li className='exchange-section__item'>
                            <div className='exchange-section__flag'>🇪🇺</div>
                            <div className='exchange-section__currency'>
                                <span className='exchange-section__currency-codes'>EUR <strong>€</strong></span>
                                <span className='exchange-section__currency-name'>Євро</span>
                            </div>
                            <div className="exchange-section__input">
                                <input
                                    value={rates.EUR}
                                    onChange={(e) => handleChange('EUR', e.target.value)}
                                    placeholder="EUR"
                                />
                            </div>
                        </li>

                        {/* RON */}
                        <li className='exchange-section__item'>
                            <div className='exchange-section__flag'>🇷🇴</div>
                            <div className='exchange-section__currency'>
                                <span className='exchange-section__currency-codes'>RON <strong>lei</strong></span>
                                <span className='exchange-section__currency-name'>Румунський лей</span>
                            </div>
                            <div className="exchange-section__input">
                                <input
                                    value={rates.RON}
                                    onChange={(e) => handleChange('RON', e.target.value)}
                                    placeholder="RON"
                                />
                            </div>
                        </li>

                    </ul>
                </div>

                <Button onClick={handleSave} />
            </div>
        </section>
    );
};

export default ExchangeSection;