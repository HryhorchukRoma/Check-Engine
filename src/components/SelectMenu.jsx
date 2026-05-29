import { useEffect, useRef, useState } from "react";
import "../styles/components/select-menu.scss";

const SelectMenu = ({ value, options, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className={`select-menu ${className}`} ref={ref}>
      <button
        type="button"
        className="select-menu__button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <span>{selectedOption?.label}</span>
        <span className={`select-menu__arrow ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="select-menu__list">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select-menu__item ${
                option.value === value ? "active" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectMenu;