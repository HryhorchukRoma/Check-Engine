import "../styles/sections/analytics-section.scss";
import { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SelectMenu from "../components/SelectMenu";
import * as XLSX from "xlsx";
import { receiptService } from "../services/checkEngineService.js";

const AnalyticsSection = () => {
  const [period, setPeriod] = useState("week");

  const [weekIndex, setWeekIndex] = useState("all");
  const [monthIndex, setMonthIndex] = useState("all");
  const [yearValue, setYearValue] = useState("all");

  const [analytics, setAnalytics] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [allReceipts, setAllReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const toDateInputValue = (date) => {
    return date.toISOString().split("T")[0];
  };

  const parseAmount = (value) => {
    const number = Number(String(value ?? "0").replace(",", "."));
    return Number.isFinite(number) ? number : 0;
  };

  const getWeekOfMonthRange = (weekNumber) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const start = new Date(year, month, 1 + (Number(weekNumber) - 1) * 7);
    const end = new Date(year, month, Number(weekNumber) * 7);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    return {
      date_from: toDateInputValue(start),
      date_to: toDateInputValue(end > lastDayOfMonth ? lastDayOfMonth : end),
    };
  };

  const dateRange = useMemo(() => {
    const now = new Date();

    if (period === "week") {
      if (weekIndex !== "all") {
        return getWeekOfMonthRange(weekIndex);
      }

      const from = new Date(now);
      from.setDate(now.getDate() - 6);

      return {
        date_from: toDateInputValue(from),
        date_to: toDateInputValue(now),
      };
    }

    if (period === "month") {
      const year = now.getFullYear();
      const month =
        monthIndex === "all" ? now.getMonth() : Number(monthIndex) - 1;

      const from = new Date(year, month, 1);
      const to = new Date(year, month + 1, 0);

      return {
        date_from: toDateInputValue(from),
        date_to: toDateInputValue(to),
      };
    }

    if (period === "year") {
      const year = yearValue === "all" ? now.getFullYear() : Number(yearValue);

      const from = new Date(year, 0, 1);
      const to = new Date(year, 11, 31);

      return {
        date_from: toDateInputValue(from),
        date_to: toDateInputValue(to),
      };
    }

    return {};
  }, [period, weekIndex, monthIndex, yearValue]);

  useEffect(() => {
    setWeekIndex("all");
    setMonthIndex("all");
    setYearValue("all");
  }, [period]);

  useEffect(() => {
    const loadAllReceipts = async () => {
      try {
        const data = await receiptService.getReceipts();
        setAllReceipts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadAllReceipts();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [analyticsData, receiptsData] = await Promise.all([
          receiptService.getAnalytics(dateRange),
          receiptService.getReceipts(dateRange),
        ]);

        setAnalytics(analyticsData);
        setReceipts(
          Array.isArray(receiptsData) ? receiptsData : receiptsData.results || []
        );
      } catch (err) {
        console.error(err);
        setError(err.message || "Не вдалося завантажити аналітику.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const availableYears = useMemo(() => {
    const years = allReceipts
      .map((receipt) => receipt.purchased_at || receipt.created_at)
      .filter(Boolean)
      .map((value) => new Date(value).getFullYear())
      .filter((year) => Number.isFinite(year));

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [allReceipts]);

  const expensesByDate = useMemo(() => {
    return (analytics?.by_day || []).map((item) => {
      const date = new Date(item.date);
      const label =
        period === "year"
          ? date.toLocaleDateString("uk-UA", { month: "short" })
          : date.toLocaleDateString("uk-UA", {
              day: "2-digit",
              month: "2-digit",
            });

      return [label, parseAmount(item.total)];
    });
  }, [analytics, period]);

  const receiptCountsByDate = useMemo(() => {
    return (analytics?.by_day || []).map((item) => {
      const date = new Date(item.date);
      const label =
        period === "year"
          ? date.toLocaleDateString("uk-UA", { month: "short" })
          : date.toLocaleDateString("uk-UA", {
              day: "2-digit",
              month: "2-digit",
            });

      return [label, Number(item.receipts || 0)];
    });
  }, [analytics, period]);

  const expensesByShop = useMemo(() => {
    const map = new Map();

    receipts.forEach((receipt) => {
      const shopName = receipt.store_name || "Без назви";
      const amount = parseAmount(receipt.total_amount);

      map.set(shopName, (map.get(shopName) || 0) + amount);
    });

    return Array.from(map.entries());
  }, [receipts]);

  const topReceipts = useMemo(() => {
    return [...receipts]
      .sort((a, b) => parseAmount(b.total_amount) - parseAmount(a.total_amount))
      .slice(0, 5)
      .map((receipt) => ({
        name: receipt.store_name || `Чек #${receipt.id}`,
        y: parseAmount(receipt.total_amount),
      }));
  }, [receipts]);

  const total = parseAmount(analytics?.total_spent);
  const avg = parseAmount(analytics?.avg_receipt);
  const count = analytics?.receipts || 0;
  const hasAnalyticsData = count > 0 && expensesByDate.length > 0;
  const currencyLabel = receipts[0]?.currency || "lei";

  const exportToExcel = () => {
    const data = receipts.map((receipt) => ({
      ID: receipt.id,
      Магазин: receipt.store_name || "",
      Дата: receipt.purchased_at || receipt.created_at || "",
      Валюта: receipt.currency || "",
      Сума: parseAmount(receipt.total_amount),
      "К-сть товарів": receipt.items_count || 0,
      Статус: receipt.status || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Checks");
    XLSX.writeFile(wb, `analytics_${period}.xlsx`);
  };

  const chartTimeOptions = {
    chart: {
      type: "areaspline",
      backgroundColor: "transparent",
      height: 280,
    },
    title: { text: "" },
    xAxis: {
      categories: expensesByDate.map(([key]) => key),
      lineColor: "transparent",
      tickColor: "transparent",
      labels: {
        style: { color: "#9B8BB4", fontSize: "12px" },
        rotation: expensesByDate.length > 7 ? -45 : 0,
      },
    },
    yAxis: {
      title: { text: "" },
      gridLineColor: "rgba(177,152,250,0.15)",
      labels: { style: { color: "#9B8BB4" } },
    },
    tooltip: {
      shared: true,
      valueSuffix: ` ${currencyLabel}`,
      backgroundColor: "#ffffff",
      borderColor: "rgba(166,132,238,0.25)",
      borderRadius: 12,
      style: { color: "#1F113E", fontWeight: "600" },
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: [0, 0, 0, 260],
          stops: [
            [0, "rgba(177,152,250,0.45)"],
            [1, "rgba(177,152,250,0.03)"],
          ],
        },
        marker: {
          radius: 4,
          fillColor: "#2F0686",
          lineWidth: 2,
          lineColor: "#ffffff",
        },
        lineWidth: 3,
      },
    },
    series: [
      {
        name: "Витрати",
        data: expensesByDate.map(([, value]) => value),
        color: "#8962FC",
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
  };

  const chartCountOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height: 240,
    },
    title: { text: "" },
    xAxis: {
      categories: receiptCountsByDate.map(([key]) => key),
      lineColor: "transparent",
      tickColor: "transparent",
      labels: {
        style: { color: "#9B8BB4", fontSize: "12px" },
      },
    },
    yAxis: {
      allowDecimals: false,
      title: { text: "" },
      gridLineColor: "rgba(177,152,250,0.15)",
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b> чеків",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      borderWidth: 0,
    },
    series: [
      {
        name: "Чеки",
        data: receiptCountsByDate.map(([, value]) => value),
        color: "#42EDAF",
        borderRadius: 6,
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
  };

  const chartShopOptions = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 280,
    },
    title: { text: "" },
    tooltip: {
      pointFormat: `<b>{point.y:.2f} ${currencyLabel}</b>`,
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
        name: currencyLabel,
        data: expensesByShop.map(([name, value], index) => ({
          name,
          y: value,
          color: colors[index % colors.length],
        })),
      },
    ],
    credits: { enabled: false },
  };

  const chartTopReceiptsOptions = {
    chart: {
      type: "bar",
      backgroundColor: "transparent",
      height: 260,
    },
    title: { text: "" },
    xAxis: {
      categories: topReceipts.map((item) => item.name),
      lineColor: "transparent",
      tickColor: "transparent",
      labels: {
        style: { color: "#1F113E", fontSize: "12px" },
      },
    },
    yAxis: {
      title: { text: "" },
      gridLineColor: "rgba(177,152,250,0.15)",
      labels: {
        style: { color: "#9B8BB4" },
      },
    },
    tooltip: {
      pointFormat: `<b>{point.y:.2f} ${currencyLabel}</b>`,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      borderWidth: 0,
    },
    series: [
      {
        name: "Сума",
        data: topReceipts.map((item) => item.y),
        color: "#F472B6",
        borderRadius: 6,
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
  };

  const weekOptions = [
    { value: "all", label: "Останні 7 днів" },
    { value: "1", label: "1 тиждень" },
    { value: "2", label: "2 тиждень" },
    { value: "3", label: "3 тиждень" },
    { value: "4", label: "4 тиждень" },
  ];

  const monthOptions = [
    { value: "all", label: "Поточний місяць" },
    { value: "1", label: "Січень" },
    { value: "2", label: "Лютий" },
    { value: "3", label: "Березень" },
    { value: "4", label: "Квітень" },
    { value: "5", label: "Травень" },
    { value: "6", label: "Червень" },
    { value: "7", label: "Липень" },
    { value: "8", label: "Серпень" },
    { value: "9", label: "Вересень" },
    { value: "10", label: "Жовтень" },
    { value: "11", label: "Листопад" },
    { value: "12", label: "Грудень" },
  ];

  const yearOptions = [
    { value: "all", label: "Поточний рік" },
    ...availableYears.map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];

  return (
  <section className="analytics-section">
    <div className="analytics-section__top">
      <h1 className="analytics-section__title">Аналітика</h1>

      <button
        className="analytics-section__exel"
        onClick={exportToExcel}
        disabled={receipts.length === 0}
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
          className={`analytics-section__item ${
            period === "week" ? "active" : ""
          }`}
          onClick={() => setPeriod("week")}
        >
          Тиждень
        </li>

        <li
          className={`analytics-section__item ${
            period === "month" ? "active" : ""
          }`}
          onClick={() => setPeriod("month")}
        >
          Місяць
        </li>

        <li
          className={`analytics-section__item ${
            period === "year" ? "active" : ""
          }`}
          onClick={() => setPeriod("year")}
        >
          Рік
        </li>
      </ul>

      {period === "week" && (
        <div className="analytics-section__filter">
          <SelectMenu
            value={weekIndex}
            options={weekOptions}
            onChange={setWeekIndex}
          />
        </div>
      )}

      {period === "month" && (
        <div className="analytics-section__filter">
          <SelectMenu
            value={monthIndex}
            options={monthOptions}
            onChange={setMonthIndex}
          />
        </div>
      )}

      {period === "year" && (
        <div className="analytics-section__filter">
          <SelectMenu
            value={yearValue}
            options={yearOptions}
            onChange={setYearValue}
          />
        </div>
      )}

      {isLoading && <p>Завантаження аналітики...</p>}

      {!isLoading && error && <p>{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="analytics-section__blocks">
            <div className="analytics-section__block">
              <img
                className="analytics-section__circle"
                src="/src/assets/icons/circle-first.svg"
                alt=""
              />

              <span className="analytics-section__label">
                Загальні витрати
              </span>

              <h3 className="analytics-section__sum">
                {total.toFixed(2)} {currencyLabel}
              </h3>
            </div>

            <div className="analytics-section__block">
              <img
                className="analytics-section__circle"
                src="/src/assets/icons/circle-second.svg"
                alt=""
              />

              <span className="analytics-section__label">Середній чек</span>

              <h3 className="analytics-section__sum">
                {avg.toFixed(2)} {currencyLabel}
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

          {hasAnalyticsData ? (
            <div className="analytics-section__charts">
              <div className="analytics-section__chart">
                <span className="analytics-section__chart-label">
                  Динаміка витрат
                </span>

                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartTimeOptions}
                />
              </div>

              <div className="analytics-section__chart">
                <span className="analytics-section__chart-label">
                  Кількість чеків
                </span>

                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartCountOptions}
                />
              </div>

              <div className="analytics-section__chart">
                <span className="analytics-section__chart-label">
                  Витрати за магазинами
                </span>

                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartShopOptions}
                />
              </div>

              <div className="analytics-section__chart">
                <span className="analytics-section__chart-label">
                  Найбільші чеки
                </span>

                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartTopReceiptsOptions}
                />
              </div>
            </div>
          ) : (
            <div className="analytics-section__empty">
              <h3>Немає даних за цей період</h3>
              <p>Завантаж чеки або вибери інший період для аналізу.</p>
            </div>
          )}
        </>
      )}
    </div>
  </section>
);
};

export default AnalyticsSection;