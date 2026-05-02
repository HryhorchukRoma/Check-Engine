import { useState, useEffect } from "react";
import "../styles/sections/products-section.scss";

import SaleIcon from "../assets/icons/sale-icon.svg";
import CloseIcon from "../assets/icons/close.svg";


const calculateProduct = (p) => {
    const qty = Number(p.qty) || 0;
    const price = Number(p.price) || 0;
    const sale = Number(p.sale) || 0;

    const total = qty * price;
    const final = total - (total * sale) / 100;

    return {
        ...p,
        total: Number(total.toFixed(2)),
        final: Number(final.toFixed(2)),
    };
};



const ProductsSection = ({ products: initialProducts = [] }) => {
    const [products, setProducts] = useState([]);

    const [activeEdit, setActiveEdit] = useState(null);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const PAGE_SIZE = 30;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= fullHeight - 100) {
                setVisibleCount((prev) => {
                    if (prev >= products.length) return prev;
                    return prev + PAGE_SIZE;
                });
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [products.length]);


    const openEdit = (index) => setActiveEdit(index);
    const closeEdit = () => setActiveEdit(null);

    const handleChange = (index, field, value) => {
        const updated = [...products];

        updated[index] = {
            ...updated[index],
            [field]: value === "" ? "" : value,
        };

        setProducts(updated);
    };

    const handleSave = (index) => {
        const updated = [...products];

        updated[index] = calculateProduct(updated[index]);

        setProducts(updated);
        closeEdit();
    };

    return (
        <section className="products-section">
            <div className="container">
                <div className="products-section__products">
                    <div className="products-section__hero">
                        <h3 className="products-section__title">Товари</h3>
                        <span className="products-section__label">
                            {products.length} позицій
                        </span>
                    </div>

                    <ul className="products-section__list">
                        {products.slice(0, visibleCount).map((product, index) => {
                            const isEditing = activeEdit === index;

                            return (
                                <li
                                    key={index}
                                    className={`products-section__item ${isEditing ? "item-edit" : ""
                                        }`}
                                >

                                    {!isEditing && (
                                        <div
                                            className="products-section__item-left"
                                            onClick={() => openEdit(index)}
                                        >
                                            <h3 className="products-section__item-title">
                                                {product.title}
                                            </h3>

                                            <div className="products-section__item-bottom">
                                                <span className="products-section__item-amount">
                                                    {product.qty} ×{" "}
                                                    <strong className="products-section__item-price">
                                                        {product.price} ₴
                                                    </strong>
                                                </span>

                                                {Number(product.sale) > 0 && (
                                                    <span className="products-section__item-sale">
                                                        <img src={SaleIcon} alt="sale" />
                                                        -{product.sale}
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
                                                        value={product.title}
                                                        onChange={(e) =>
                                                            handleChange(index, "title", e.target.value)
                                                        }
                                                    />
                                                </label>

                                                <div className="row">
                                                    <label className="products-section__field">
                                                        <span>К-сть</span>
                                                        <input
                                                            type="number"
                                                            value={product.qty}
                                                            onChange={(e) =>
                                                                handleChange(index, "qty", e.target.value)
                                                            }
                                                        />
                                                    </label>

                                                    <label className="products-section__field">
                                                        <span>Ціна (₴)</span>
                                                        <input
                                                            type="number"
                                                            value={product.price}
                                                            onChange={(e) =>
                                                                handleChange(index, "price", e.target.value)
                                                            }
                                                        />
                                                    </label>

                                                    <label className="products-section__field">
                                                        <span>% Знижка</span>
                                                        <input
                                                            type="number"
                                                            value={product.sale}
                                                            onChange={(e) =>
                                                                handleChange(index, "sale", e.target.value)
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="products-section__buttons">
                                                <button
                                                    className="products-section__save-btn button button--purple-filling"
                                                    onClick={() => handleSave(index)}
                                                >
                                                    Зберегти
                                                </button>

                                                <button
                                                    className="products-section__edit-close"
                                                    onClick={closeEdit}
                                                >
                                                    <img src={CloseIcon} alt="close" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!isEditing && (
                                        <div className="products-section__item-right">

                                            {Number(product.sale) > 0 && (
                                                <span className="products-section__item-full-sum">
                                                    {product.total} ₴
                                                </span>
                                            )}

                                            <span className="products-section__item-sale-sum">
                                                {product.final} ₴
                                            </span>

                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default ProductsSection;