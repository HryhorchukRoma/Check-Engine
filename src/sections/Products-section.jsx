import { useState, useEffect } from "react";
import "../styles/sections/products-section.scss";

import SaleIcon from "../assets/icons/sale-icon.svg";
import CloseIcon from "../assets/icons/close.svg";

const EMPTY_ITEMS = [];

const CURRENCY_SYMBOLS = {
    UAH: "₴",
    USD: "$",
    EUR: "€",
    RON: "RON",
};

const toNumber = (value) => {
    const number = Number(String(value ?? "0").replace(",", "."));
    return Number.isFinite(number) ? number : 0;
};

const getCurrency = (currency) => {
    return CURRENCY_SYMBOLS[currency] || currency || "₴";
};

const formatMoney = (value, currency = "UAH") => {
    return `${toNumber(value).toFixed(2)} ${getCurrency(currency)}`;
};

const formatQuantity = (value) => {
    const number = toNumber(value);

    if (Number.isInteger(number)) {
        return String(number);
    }

    return number.toFixed(3).replace(/\.?0+$/, "");
};

const calculateLineTotal = (item) => {
    const quantity = toNumber(item.quantity);
    const unitPrice = toNumber(item.unit_price);
    const discount = toNumber(item.discount);

    return Math.max(quantity * unitPrice + discount, 0);
};

const normalizeItemForPatch = (item, index) => {
    const quantity = toNumber(item.quantity);
    const unitPrice = toNumber(item.unit_price);
    const discount = toNumber(item.discount);
    const lineTotal = quantity * unitPrice;

    return {
        ...(item.id ? { id: item.id } : {}),

        name_raw: item.name_raw || "",
        name_norm: item.name_norm || "",

        quantity: quantity.toFixed(3),
        unit_price: unitPrice.toFixed(2),
        discount: discount.toFixed(2),
        line_total: lineTotal.toFixed(2),

        position: item.position || index + 1,
    };
};

const ProductsSection = ({
                             items: initialItems = EMPTY_ITEMS,
                             inline_errors,
                             currency = "UAH",
                             onSave,
                         }) => {
    const [items, setItems] = useState(initialItems);
    const [activeEdit, setActiveEdit] = useState(null);
    const [savingIndex, setSavingIndex] = useState(null);
    const [error, setError] = useState("");

    const PAGE_SIZE = 30;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        setItems(initialItems || EMPTY_ITEMS);
        setVisibleCount(PAGE_SIZE);
        setActiveEdit(null);
    }, [initialItems]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= fullHeight - 100) {
                setVisibleCount((prev) => {
                    if (prev >= items.length) return prev;
                    return prev + PAGE_SIZE;
                });
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [items.length]);

    const openEdit = (index) => {
        setError("");
        setActiveEdit(index);
    };

    const closeEdit = () => {
        setError("");
        setActiveEdit(null);
    };

    const handleChange = (index, field, value) => {
        setItems((prev) => {
            const updated = [...prev];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    };

    const handleSave = async (index) => {
        const updatedItems = items.map((item, itemIndex) => {
            if (itemIndex !== index) {
                return normalizeItemForPatch(item, itemIndex);
            }

            return normalizeItemForPatch(item, itemIndex);
        });

        try {
            setSavingIndex(index);
            setError("");

            setItems(updatedItems);

            const updatedCheck = await onSave?.(updatedItems);

            if (updatedCheck?.items) {
                setItems(updatedCheck.items);
            }

            setActiveEdit(null);
        } catch (err) {
            console.error("Помилка збереження товару:", err);
            setError(err.message || "Не вдалося зберегти зміни.");
        } finally {
            setSavingIndex(null);
        }
    };

    const errorPositionChecker = (index) =>
        inline_errors.some((itemIndex) => Number(itemIndex) === Number(index+1));

    return (
        <section className="products-section">
            <div className="container">
                <div className="products-section__products">
                    <div className="products-section__hero">
                        <h3 className="products-section__title">Товари</h3>

                        <span className="products-section__label">
              {items.length} позицій
            </span>
                    </div>

                    {error && (
                        <p className="products-section__error">
                            {error}
                        </p>
                    )}

                    {items.length === 0 ? (
                        <p className="products-section__empty">
                            У цьому чеку немає товарів
                        </p>
                    ) : (
                        <ul className="products-section__list">
                            {items.slice(0, visibleCount).map((item, index) => {
                                const isEditing = activeEdit === index;
                                const isSaving = savingIndex === index;

                                const quantity = item.quantity ?? "";
                                const unitPrice = item.unit_price ?? "";
                                const discount = item.discount ?? "0.00";

                                const totalWithoutDiscount =
                                    toNumber(quantity) * toNumber(unitPrice);

                                item.line_total !== undefined && item.line_total !== ""
                                    ? toNumber(item.line_total)
                                    : calculateLineTotal(item);
                                return (

                                    <li
                                        key={item.id || item.position || index}
                                        className={`products-section__item ${
                                            isEditing ? "item-edit" : ""
                                        }`}
                                    >
                                        {!isEditing && (
                                            <div
                                                className="products-section__item-left"
                                                onClick={() => openEdit(index)}
                                            >
                                                <h3 className="products-section__item-title">
                                                    {item.name_raw || "Без назви"}
                                                </h3>

                                                <div className="products-section__item-bottom">
                                                      <span className="products-section__item-amount">
                                                        {formatQuantity(quantity)} ×{" "}
                                                          <strong className="products-section__item-price">
                                                          {formatMoney(unitPrice, currency)}
                                                        </strong>

                                                      </span>

                                                    {errorPositionChecker(index) && (
                                                        <span className="products-section__item-sale">
                                                          <img src={SaleIcon} alt="sale" />
                                                          Помилка
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <div className="products-section__item-edit">
                                                <div className="products-section__edit-grid">
                                                    <label className="products-section__field">
                                                        <input
                                                            type="text"
                                                            value={item.name_raw || ""}
                                                            onChange={(e) =>
                                                                handleChange(index, "name_raw", e.target.value)
                                                            }
                                                            placeholder="Назва товару"
                                                            disabled={isSaving}
                                                        />
                                                    </label>

                                                    <div className="row">
                                                        <label className="products-section__field">
                                                            <span>К-сть</span>
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                value={item.quantity || ""}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        "quantity",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                disabled={isSaving}
                                                            />
                                                        </label>

                                                        <label className="products-section__field">
                                                            <span>Ціна ({getCurrency(currency)})</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.unit_price || ""}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        "unit_price",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                disabled={isSaving}
                                                            />
                                                        </label>

                                                        <label className="products-section__field">
                                                            <span>Знижка ({getCurrency(currency)})</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.discount || ""}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        "discount",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                disabled={isSaving}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="products-section__buttons">
                                                    <button
                                                        className="products-section__save-btn button button--purple-filling"
                                                        onClick={() => handleSave(index)}
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? "Збереження..." : "Зберегти"}
                                                    </button>

                                                    <button
                                                        className="products-section__edit-close"
                                                        onClick={closeEdit}
                                                        disabled={isSaving}
                                                    >
                                                        <img src={CloseIcon} alt="close" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <div className="products-section__item-right">
                                                <span className="products-section__item-sale-sum">
                                                    {formatMoney(totalWithoutDiscount, currency)}
                                                </span>

                                                {toNumber(discount) < 0 && (
                                                    <span className="products-section__item-full-sum">
                                                        {discount}
                                                    </span>
                                                )}

                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductsSection;