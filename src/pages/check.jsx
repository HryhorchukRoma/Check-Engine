import * as XLSX from "xlsx";

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
    
    const [receiptDraft, setReceiptDraft] = useState(check);
    const [deletedItemIds, setDeletedItemIds] = useState([]);

    useEffect(() => {
        setReceiptDraft(check);
    }, [check]);

    const handleItemsChange = (updatedItems, removedItemId = null) => {
    setReceiptDraft((prev) => ({
        ...prev,
        items: updatedItems,
    }));

    if (removedItemId) {
        setDeletedItemIds((prev) => [...prev, removedItemId]);
    }
};

    const handleSaveReceipt = async () => {
    if (!receiptDraft) return;

    try {
        await receiptService.updateReceipt(id, {
            items: receiptDraft.items || [],
            deletedItemIds,
        });

        window.location.reload();
    } catch (err) {
        console.error(err);
        alert(err.message || "Не вдалося зберегти зміни чеку.");
    }
};
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
    const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("uk-UA");
};

const exportCheckToExcel = (mode) => {
    const currentCheck = receiptDraft || check;

    if (!currentCheck) return;

    const items = currentCheck.items || [];

    const itemsRows = items.map((item) => ({
        Позиція: item.position,
        Назва: item.name_raw,
        "Нормалізована назва": item.name_norm,
        Кількість: item.quantity,
        Ціна: item.unit_price,
        Знижка: item.discount,
        Сума: item.line_total,
    }));

    const wb = XLSX.utils.book_new();

    if (mode === "full") {
        const infoRows = [
            { Поле: "ID", Значення: currentCheck.id },
            { Поле: "Магазин", Значення: currentCheck.store_name },
            { Поле: "Адреса", Значення: currentCheck.store_address },
            { Поле: "Дата", Значення: formatDateTime(currentCheck.purchased_at) },
            { Поле: "Валюта", Значення: currentCheck.currency },
            { Поле: "Спосіб оплати", Значення: currentCheck.payment_method },
            { Поле: "ПДВ", Значення: currentCheck.vat_amount },
            { Поле: "Загальна сума", Значення: currentCheck.total_amount },
            { Поле: "Кількість товарів", Значення: currentCheck.items_count },
            { Поле: "Статус", Значення: currentCheck.status },
        ];

        const infoSheet = XLSX.utils.json_to_sheet(infoRows);
        XLSX.utils.book_append_sheet(wb, infoSheet, "Інформація");
    }

    const itemsSheet = XLSX.utils.json_to_sheet(itemsRows);
    XLSX.utils.book_append_sheet(wb, itemsSheet, "Товари");

    const fileName =
        mode === "full"
            ? `check_${currentCheck.id}_full.xlsx`
            : `check_${currentCheck.id}_items.xlsx`;

    XLSX.writeFile(wb, fileName);
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
                onItemsChange={handleItemsChange}
            />

            <CheckExchangeSection
                checkId={check.id}
                onSave={handleSaveReceipt}
                onDelete={handleDelete}
                onExport={exportCheckToExcel}
/>
        </>
    );
};

export default Check;