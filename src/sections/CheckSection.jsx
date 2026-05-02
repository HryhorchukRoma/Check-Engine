
import '../styles/sections/check-section.scss';

const CheckSection = ({ data }) => {
    return (
        <div className="check-section">
            <img className='check-section__icon' src="/src/assets/icons/shop-icon.svg" alt="" />
            <div className='check-section__content'>
                <div className='check-section__block'>
                    <span className='check-section__name'>{data.shopName}</span>
                    <span className='check-section__price'>{data.price}</span>
                </div>
                <div className='check-section__block'>
                    <span className='check-section__date'>{data.formattedDate}</span>
                    <span className='check-section__number'>к-сть товарів: {data.itemsCount}</span>
                </div>
            </div>
        </div>
    );
};

export default CheckSection;