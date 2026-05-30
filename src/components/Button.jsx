import Icon from "../assets/icons/save.svg?react";

const Button = ({
  onClick,
  status = "idle",
  children = "Зберегти",
  className = "",
  disabled = false,
}) => {
  const getText = () => {
    if (status === "saving") return "Збереження...";
    if (status === "saved") return "Збережено";
    return children;
  };

  return (
    <button
      type="button"
      className={`button button--purple ${status !== "idle" ? `button--${status}` : ""} ${className}`}
      onClick={onClick}
      disabled={disabled || status === "saving"}
    >
      <Icon />
      {getText()}
    </button>
  );
};

export default Button;