export function formatReceiptDateTime(value) {
    if (!value) return "Дата невідома";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Дата невідома";
    }

    const formattedDate = date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${formattedDate}, ${formattedTime}`;
}