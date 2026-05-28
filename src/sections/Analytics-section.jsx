import "../styles/sections/analytics-section.scss";
import { useMemo, useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { checks } from "../data/Checks";
import * as XLSX from "xlsx";

const AnalyticsSection = () => {
    const [period, setPeriod] = useState("week");

    const [weekIndex, setWeekIndex] = useState("all");
    const [monthIndex, setMonthIndex] = useState("all");
    const [yearValue, setYearValue] = useState("all");

    const parsePrice = (price) =>
        typeof price === "number"
            ? price
            : parseFloat(String(price).replace(/[^\d.]/g, "") || 0);

    const now = new Date();

    useEffect(() => {
        setWeekIndex("all");
        setMonthIndex("all");
        setYearValue("all");
    }, [period]);

    const getWeekOfMonth = (date) => {
        const d = new Date(date);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const day = start.getDay() || 7;
        return Math.ceil((d.getDate() + day - 1) / 7);
    };

    const getMonth = (d) => new Date(d).getMonth() + 1;
    const getYear = (d) => new Date(d).getFullYear();


    const filteredChecks = useMemo(() => {
        const now = new Date();

        return checks.filter((c) => {
            const d = new Date(c.date);

            const year = d.getFullYear();
            const month = d.getMonth() + 1;

            // ================= WEEK (weeks of month) =================
            if (period === "week") {
                const week = getWeekOfMonth(d);

                if (weekIndex !== "all") {
                    if (week.toString() !== weekIndex) return false;
                }

                if (
                    d.getMonth() !== now.getMonth() ||
                    d.getFullYear() !== now.getFullYear()
                ) return false;
            }

            // ================= MONTH =================
            if (period === "month") {
                if (monthIndex === "all") {
                    if (
                        d.getMonth() !== now.getMonth() ||
                        d.getFullYear() !== now.getFullYear()
                    ) return false;
                } else {
                    if (month.toString() !== monthIndex) return false;
                }
            }

            // ================= YEAR =================
            if (period === "year") {
                if (yearValue === "all") {
                    if (year !== now.getFullYear()) return false;
                } else {
                    if (year.toString() !== yearValue) return false;
                }
            }

            return true;
        });
    }, [period, weekIndex, monthIndex, yearValue]);


    const expensesByDate = useMemo(() => {
        const map = new Map();

        filteredChecks.forEach((c) => {
            const d = new Date(c.date);
            const price = parsePrice(c.price);

            let key;

            if (period === "week" || period === "month") {
                key = d.toLocaleDateString("uk-UA", {
                    day: "2-digit",
                    month: "2-digit",
                });
            } else {
                key = d.toLocaleString("uk-UA", {
                    month: "short",
                });
            }

            map.set(key, (map.get(key) || 0) + price);
        });

        return Array.from(map.entries());
    }, [filteredChecks, period]);

    const expensesByShop = useMemo(() => {
        const map = {};

        filteredChecks.forEach((c) => {
            const price = parsePrice(c.price);
            map[c.shopName] = (map[c.shopName] || 0) + price;
        });

        return Object.entries(map);
    }, [filteredChecks]);

    const total = filteredChecks.reduce(
        (acc, c) => acc + parsePrice(c.price),
        0
    );

    const avg = filteredChecks.length ? total / filteredChecks.length : 0;
    const count = filteredChecks.length;

    const colors = [
        "#e7ed42",
        "#F472B6",
        "#42EDAF",
        "#423ff8",
        "#f83f3f",
        "#FB923C",
        "#3fdcf8",
        "#8962FC",
    ];


    const exportToExcel = () => {
        const data = filteredChecks.map((c) => ({
            ID: c.id,
            Магазин: c.shopName,
            Адреса: c.address,
            Дата: c.date,
            Час: c.time,
            Сума: parsePrice(c.price),
            "К-сть товарів": c.itemsCount,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Checks");
        XLSX.writeFile(wb, `analytics_${period}.xlsx`);
    };

    const chartTimeOptions = {
        chart: {
            type: "column",
            backgroundColor: "transparent",
        },

        title: { text: "" },

        xAxis: {
            categories: expensesByDate.map(([k]) => k),
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

        series: [
            {
                name: "грн",
                data: expensesByDate.map(([, v]) => v),
                color: "#B198FA",
            },
        ],

        credits: { enabled: false },
    };


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
                <h1 className="analytics-section__title">Аналітика</h1>

                <button
                    className="analytics-section__exel"
                    onClick={exportToExcel}
                >
                    <img
                        className="analytics-section__icon"
                        src="/src/assets/icons/exel.svg"
                        alt=""
                    />
                    Excel
                </button>
            </div>

            <div className="container">
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

                {/* SELECTS */}
                {period === "week" && (
                    <select className="analytics-section__filter" value={weekIndex} onChange={(e) => setWeekIndex(e.target.value)}>
                        <option value="all">Останні 7 днів</option>
                        <option value="1">1 тиждень</option>
                        <option value="2">2 тиждень</option>
                        <option value="3">3 тиждень</option>
                        <option value="4">4 тиждень</option>
                    </select>
                )}

                {period === "month" && (
                    <select className="analytics-section__filter" value={monthIndex} onChange={(e) => setMonthIndex(e.target.value)}>
                        <option value="all">Поточний місяць</option>
                        <option value="1">Січень</option>
                        <option value="2">Лютий</option>
                        <option value="3">Березень</option>
                        <option value="4">Квітень</option>
                        <option value="5">Травень</option>
                        <option value="6">Червень</option>
                        <option value="7">Липень</option>
                        <option value="8">Серпень</option>
                        <option value="9">Вересень</option>
                        <option value="10">Жовтень</option>
                        <option value="11">Листопад</option>
                        <option value="12">Грудень</option>
                    </select>
                )}

                {period === "year" && (
                    <select className="analytics-section__filter" value={yearValue} onChange={(e) => setYearValue(e.target.value)}>
                        <option value="all">Поточний рік</option>
                        {Array.from(
                            new Set(checks.map((c) => getYear(c.date)))
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                )}

                {/* STATS */}
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

                {/* CHARTS */}
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