import "../styles/sections/analytics-section.scss";
import { useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { checks } from "../data/Checks";
import * as XLSX from "xlsx";

const AnalyticsSection = () => {

    //exel
    const exportToExcel = () => {
        const data = filteredChecks.map((c) => ({
            "ID": c.id,
            "Магазин": c.shopName,
            "Адреса": c.address,
            "Дата": c.date,
            "Час": c.time,
            "Сума": parsePrice(c.price),
            "К-сть товарів": c.itemsCount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Checks");

        XLSX.writeFile(workbook, `analytics_${period}.xlsx`);
    };

    const [period, setPeriod] = useState("month");

    const parsePrice = (price) => parseFloat(price.replace(/[^\d.]/g, ""));

    // фільтр по табах
    const filteredChecks = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return checks.filter((c) => {
            const d = new Date(c.date);
            d.setHours(0, 0, 0, 0);

            if (period === "week") {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                weekAgo.setHours(0, 0, 0, 0);

                return d >= weekAgo && d <= today;
            }

            if (period === "month") {
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                monthEnd.setHours(23, 59, 59, 999);

                return d >= monthStart && d <= monthEnd;
            }

            if (period === "year") {
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const yearEnd = new Date(now.getFullYear(), 11, 31);
                yearEnd.setHours(23, 59, 59, 999);

                return d >= yearStart && d <= yearEnd;
            }

            return true;
        });
    }, [period]);

    // Функція для отримання номера тижня
    const getWeekNumber = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    // Функція для форматування тижня
    const formatWeekRange = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;

        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return `${monday.getDate()}.${monday.getMonth() + 1} - ${sunday.getDate()}.${sunday.getMonth() + 1}`;
    };

    // по датах з групуванням
    const expensesByDate = useMemo(() => {
        if (period === "week") {
            // Групуємо по днях
            const map = new Map();
            filteredChecks.forEach((c) => {
                const date = c.date;
                map.set(date, (map.get(date) || 0) + parsePrice(c.price));
            });
            return Array.from(map.entries()).sort(([a], [b]) => new Date(a) - new Date(b));
        }
        else if (period === "month") {
            // Групуємо по тижнях
            const weekMap = new Map();

            filteredChecks.forEach((c) => {
                const weekNum = getWeekNumber(c.date);
                const weekKey = `${new Date(c.date).getFullYear()}-W${weekNum}`;
                const weekLabel = formatWeekRange(c.date);

                if (!weekMap.has(weekKey)) {
                    weekMap.set(weekKey, { label: weekLabel, total: 0 });
                }
                weekMap.get(weekKey).total += parsePrice(c.price);
            });

            return Array.from(weekMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([, value]) => [value.label, value.total]);
        }
        else {
            // Групуємо по місяцях (для року)
            const monthMap = new Map();

            filteredChecks.forEach((c) => {
                const d = new Date(c.date);
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                const monthLabel = d.toLocaleString('uk-UA', { month: 'long' });

                if (!monthMap.has(monthKey)) {
                    monthMap.set(monthKey, { label: monthLabel, total: 0 });
                }
                monthMap.get(monthKey).total += parsePrice(c.price);
            });

            return Array.from(monthMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([, value]) => [value.label, value.total]);
        }
    }, [filteredChecks, period]);

    // по магазинах
    const expensesByShop = useMemo(() => {
        const map = {};

        filteredChecks.forEach((c) => {
            if (!map[c.shopName]) map[c.shopName] = 0;
            map[c.shopName] += parsePrice(c.price);
        });

        return Object.entries(map);
    }, [filteredChecks]);

    // метрики
    const total = filteredChecks.reduce((acc, c) => acc + parsePrice(c.price), 0);
    const avg = filteredChecks.length ? total / filteredChecks.length : 0;
    const count = filteredChecks.length;

    // кольори
    const colors = ["#e7ed42", "#F472B6", "#42EDAF", "#423ff8", "#f83f3f", "#FB923C", "#3fdcf8", "#8962FC"];

    // графік 1 (СТОВПЧИКИ)
    const chartTimeOptions = {
        chart: {
            type: "column",
            backgroundColor: "transparent",
        },

        title: { text: "" },

        xAxis: {
            categories: expensesByDate.map(([d]) => d),
            lineColor: "transparent",
            tickColor: "transparent",
            labels: {
                style: {
                    color: "#9B8BB4",
                    fontSize: "12px",
                },
                rotation: expensesByDate.length > 7 ? -45 : 0,
            },
        },

        yAxis: {
            title: { text: "" },
            gridLineColor: "rgba(177,152,250,0.15)",
            labels: {
                style: {
                    color: "#9B8BB4",
                },
            },
        },

        tooltip: {
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 10,
            borderWidth: 0,
            style: {
                color: "#1F113E",
            },
        },

        plotOptions: {
            column: {
                borderRadius: 8,
                borderWidth: 0,
                pointPadding: 0.1,
                groupPadding: 0.1,
            },
        },

        series: [
            {
                name: "грн",
                data: expensesByDate.map(([, v]) => v),
                color: "#B198FA",
            },
        ],

        credits: { enabled: false },
    };

    // графік 2 (КРУГ)
    const chartShopOptions = {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
        },

        title: { text: "" },

        tooltip: {
            pointFormat: "<b>{point.y:.2f} грн</b>",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 10,
            borderWidth: 0,
            style: {
                fontSize: "12px",
                color: "#1F113E",
                fontWeight: "600",
            },
        },

        plotOptions: {
            pie: {
                borderWidth: 0,
                innerSize: "60%",
                dataLabels: {
                    enabled: true,
                    style: {
                        color: "#1F113E",
                        textOutline: "none",
                        fontSize: "14px",
                    },
                },
            },
        },

        series: [
            {
                name: "грн",
                data: expensesByShop.map(([name, value], i) => ({
                    name,
                    y: value,
                    color: colors[i % colors.length],
                })),
            },
        ],

        credits: { enabled: false },
    };

    return (
        <section className="analytics-section">
            <div className="analytics-section__top">
                <h1 className='analytics-section__title'>Аналітика</h1>
                <button
                    className="analytics-section__exel"
                    onClick={exportToExcel}
                >
                    <img className="analytics-section__icon" src="/src/assets/icons/exel.svg" alt="" />
                    Excel
                </button>
            </div>

            <div className="container">
                {/* tabs */}
                <ul className="analytics-section__tabs">
                    <li
                        className={`analytics-section__item ${period === "week" ? "active" : ""}`}
                        onClick={() => setPeriod("week")}
                    >
                        Тиждень
                    </li>

                    <li
                        className={`analytics-section__item ${period === "month" ? "active" : ""}`}
                        onClick={() => setPeriod("month")}
                    >
                        Місяць
                    </li>

                    <li
                        className={`analytics-section__item ${period === "year" ? "active" : ""}`}
                        onClick={() => setPeriod("year")}
                    >
                        Рік
                    </li>
                </ul>

                {/* блоки */}
                <div className="analytics-section__blocks">
                    <div className="analytics-section__block">
                        <img className="analytics-section__circle" src="/src/assets/icons/circle-first.svg" alt="" />
                        <span className="analytics-section__label">Загальні витрати</span>
                        <h3 className="analytics-section__sum">
                            {total.toFixed(2)} грн
                        </h3>
                    </div>

                    <div className="analytics-section__block">
                        <img className="analytics-section__circle" src="/src/assets/icons/circle-second.svg" alt="" />
                        <span className="analytics-section__label">Середній чек</span>
                        <h3 className="analytics-section__sum">
                            {avg.toFixed(2)} грн
                        </h3>
                    </div>
                </div>

                <div className="analytics-section__numbers-checks">
                    <span className="analytics-section__numbers-info">
                        Кількість чеків
                        <strong>{count}</strong>
                    </span>
                    <img src="/src/assets/icons/numbers-checks.svg" alt="" />
                </div>

                {/* графіки */}
                <div className="analytics-section__charts">
                    <div className="analytics-section__chart">
                        <span className="analytics-section__chart-label">Витрати за часом</span>
                        <HighchartsReact highcharts={Highcharts} options={chartTimeOptions} />
                    </div>

                    <div className="analytics-section__chart">
                        <span className="analytics-section__chart-label">Витрати за магазинами</span>
                        <HighchartsReact highcharts={Highcharts} options={chartShopOptions} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AnalyticsSection;