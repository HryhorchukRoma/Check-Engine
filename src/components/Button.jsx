import Icon from '../assets/icons/save.svg?react';

const Button = ({ onClick }) => {
    return (
        <button
            className="button button--purple"
            onClick={onClick}
        >
            <Icon />
            Зберегти
        </button>
    );
};

export default Button;