
import '../styles/sections/check-section.scss';
import {formatReceiptDateTime} from "../utils/formatReceiptDateTime.js";

const CheckSection = ({ data }) => {
    console.log(data);
    return (
        <div className="check-section">
            <img className='check-section__icon' src="/src/assets/icons/shop-icon.svg" alt="" />
            <div className='check-section__content'>
                <div className='check-section__block'>
                    <span className='check-section__name'>{data.store_name}</span>
                    <span className='check-section__price'>{data.total_amount}</span>
                </div>
                <div className='check-section__block'>
                    <span className='check-section__date'>{formatReceiptDateTime(data.purchased_at)}</span>
                    <span className='check-section__number'>к-сть товарів: {data.items_count}</span>
                </div>
            </div>
        </div>
    );
};

export default CheckSection;