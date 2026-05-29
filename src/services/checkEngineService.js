import axios from "axios";

function getBaseUrl() {
    const viteUrl =
        typeof import.meta !== "undefined"
            ? import.meta.env?.VITE_API_BASE_URL
            : undefined;

    return viteUrl || "http://127.0.0.1:8000/api/";
}



const api = axios.create({
    baseURL: getBaseUrl().replace(/\/$/, ""),
    timeout: 60000,
    withCredentials: false,
});



function cleanParams(params = {}) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => {
            return value !== undefined && value !== null && value !== "";
        })
    );
}



function normalizeAxiosError(error) {
    if (error.response) {
        const message =
            error.response.data?.detail ||
            error.response.data?.message ||
            "Помилка запиту до сервера";

        return {
            message,
            status: error.response.status,
            data: error.response.data,
            originalError: error,
        };
    }

    if (error.request) {
        return {
            message: "Сервер не відповідає. Перевір, чи запущений бекенд.",
            status: null,
            data: null,
            originalError: error,
        };
    }

    return {
        message: error.message || "Невідома помилка",
        status: null,
        data: null,
        originalError: error,
    };
}



api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeAxiosError(error))
);



function saveBlobAsFile(blob, filename = "receipts_export.xlsx") {
    if (typeof window === "undefined") return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}



function normalizeReceiptItem(item, index) {
    const quantity = item.quantity ?? "1.000";
    const unitPrice = item.unit_price ?? item.unitPrice ?? "0.00";
    const discount = item.discount ?? "0.00";

    return {
        ...(item.id ? { id: item.id } : {}),

        name_raw: item.name_raw ?? item.nameRaw ?? item.name ?? "",
        name_norm: item.name_norm ?? item.nameNorm ?? "",
        quantity: String(quantity),
        unit_price: String(unitPrice),

        line_total: String(
            item.line_total ??
            item.lineTotal ??
            (Number(quantity) * Number(unitPrice) - Number(discount)).toFixed(2)
        ),

        discount: String(discount),
        position: item.position ?? index + 1,
    };
}



function normalizeReceiptPatchPayload(payload = {}) {
    const normalized = { ...payload };

    if (Array.isArray(payload.items)) {
        normalized.items = payload.items.map(normalizeReceiptItem);
    }

    if (Array.isArray(payload.deletedItemIds)) {
        normalized.deleted_item_ids = payload.deletedItemIds;
        delete normalized.deletedItemIds;
    }

    return normalized;
}



export const receiptService = {
    async uploadReceipt(file, options = {}) {
        if (!file) {
            throw new Error("Файл чеку обов'язковий");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/receipt/upload", formData, {
            onUploadProgress: options.onUploadProgress,
        });

        return response.data;
    },

    async getReceipts(filters = {}) {
        const response = await api.get("/receipts", {
            params: cleanParams({
                store: filters.store,
                date_from: filters.date_from ?? filters.dateFrom,
                date_to: filters.date_to ?? filters.dateTo,
                min_total: filters.min_total ?? filters.minTotal,
                max_total: filters.max_total ?? filters.maxTotal,
            }),
        });

        return response.data;
    },

    async getReceipt(id) {
        const response = await api.get(`/receipt/${id}`);
        return response.data;
    },

    async updateReceipt(id, payload) {
        const response = await api.patch(
            `/receipt/${id}`,
            normalizeReceiptPatchPayload(payload)
        );

        return response.data;
    },

    async deleteReceipt(id) {
        const response = await api.delete(`/receipt/${id}`);
        return response.data;
    },

    async getAnalytics(filters = {}) {
        const response = await api.get("/analytics", {
            params: cleanParams({
                date_from: filters.date_from ?? filters.dateFrom,
                date_to: filters.date_to ?? filters.dateTo,
            }),
        });

        return response.data;
    },

    async exportReceipts(idsOrId, options = {}) {
        const payload = Array.isArray(idsOrId)
            ? { receipt_ids: idsOrId }
            : { receipt_id: idsOrId };

        const response = await api.post("/receipt/export", payload, {
            responseType: "blob",
        });

        const blob = response.data;

        if (options.download) {
            saveBlobAsFile(blob, options.filename || "receipts_export.xlsx");
        }

        return blob;
    },
};



export const inventoryService = {
    async getInventory(filters = {}) {
        const response = await api.get("/inventory", {
            params: cleanParams({
                search: filters.search,
                available: filters.available,
            }),
        });

        return response.data;
    },

    async getInventoryItem(id) {
        const response = await api.get(`/inventory/${id}`);
        return response.data;
    },

    async updateInventoryItem(id, payload) {
        const response = await api.patch(`/inventory/${id}`, payload);
        return response.data;
    },

    async deleteInventoryItem(id) {
        const response = await api.delete(`/inventory/${id}`);
        return response.data;
    },
}; 