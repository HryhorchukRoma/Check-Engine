import { useEffect, useMemo, useState } from "react";

import CheckList from "../sections/CheckList";
import HistoryHeroSection from "../sections/HistoryHeroSection";

import { receiptService } from "../services/checkEngineService.js";

const History = () => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(true);

  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await receiptService.getReceipts();

        setReceipts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Не вдалося завантажити чеки.");
      } finally {
        setIsLoading(false);
      }
    };

    loadReceipts();
  }, []);

  const getReceiptDate = (receipt) => {
    const source = receipt.purchased_at || receipt.created_at;

    if (!source) return "";

    const date = new Date(source);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  const normalizeDate = (dateString) => {
    if (!dateString) {
      return {
        raw: "",
        day: "",
        month: "",
        year: "",
        fullText: "",
      };
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return {
        raw: dateString,
        day: "",
        month: "",
        year: "",
        fullText: dateString,
      };
    }

    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();

    const monthName = date.toLocaleDateString("uk-UA", {
      month: "long",
    });

    return {
      raw: dateString,
      day,
      month,
      year,
      fullText: `${day} ${monthName} ${year}`,
    };
  };



  const finalReceipts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return receipts.filter((receipt) => {
      const receiptDate = getReceiptDate(receipt);

      if (!showAll && receiptDate !== today) {
        return false;
      }

      if (!q) return true;

      const date = normalizeDate(receiptDate);
      console.log(receipt);
      return (
          (receipt.store_name || "").toLowerCase().includes(q) ||
          (receipt.store_address || "").toLowerCase().includes(q) ||
          (receipt.total_amount || "").toLowerCase() ||
          date.raw.includes(q) ||
          date.day.includes(q) ||
          date.month.includes(q) ||
          date.year.includes(q) ||
          date.fullText.toLowerCase().includes(q)
      );
    });
  }, [receipts, search, showAll, today]);

  const handleToggle = () => {
    setShowAll((prev) => !prev);
  };

  console.log(finalReceipts)

  return (
      <>
        <HistoryHeroSection
            search={search}
            setSearch={setSearch}
            onToggle={handleToggle}
            showAll={showAll}
        />

        {isLoading && (
            <div className="container">
              <p>Завантаження чеків...</p>
            </div>
        )}

        {!isLoading && error && (
            <div className="container">
              <p>{error}</p>
            </div>
        )}

        {!isLoading && !error && (
            <CheckList checks={finalReceipts} showAll={showAll} />
        )}
      </>
  );
};

export default History;