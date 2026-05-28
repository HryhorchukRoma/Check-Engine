import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CheckHeroSection from "../sections/Check-hero-section";
import ProductsSection from "../sections/Products-section";
import CheckExchangeSection from "../sections/Check-exchange-section";

import { receiptService } from "../services/checkEngineService.js";

const Check = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [check, setCheck] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCheck = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await receiptService.getReceipt(id);
                setCheck(data);
            } catch (err) {
                console.error(err);
                setError(err.message || "Не вдалося завантажити чек.");
            } finally {
                setIsLoading(false);
            }
        };

        loadCheck();
    }, [id]);

    const handleProductsSave = async (updatedItems) => {
        const updatedCheck = await receiptService.updateReceipt(id, {
            items: updatedItems,
        });

        setCheck(updatedCheck);

        return updatedCheck;
    };

    const handleDelete = async () => {
        try {
            await receiptService.deleteReceipt(id);
            navigate("/history");
        } catch (err) {
            console.error(err);
            alert(err.message || "Не вдалося видалити чек.");
        }
    };

    if (isLoading) {
        return (
            <div className="container">
                <p>Завантаження чеку...</p>
            </div>
        );
    }

    if (error || !check) {
        return (
            <div className="container">
                <p>{error || "Чек не знайдено."}</p>
            </div>
        );
    }

    return (
        <>
            <CheckHeroSection check={check} />

            <ProductsSection
                items={check.items || []}
                inline_errors = {check.inline_errors}
                currency={check.currency}
                onSave={handleProductsSave}
            />

            <CheckExchangeSection
                checkId={check.id}
                onDelete={handleDelete}
            />
        </>
    );
};

export default Check;