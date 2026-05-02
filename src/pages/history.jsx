import CheckList from "../sections/CheckList";
import HistoryHeroSection from "../sections/HistoryHeroSection";
import React, { useState } from "react";
import { checks } from "../data/checks";

const History = () => {
    const [search, setSearch] = useState("");
    const [showAll, setShowAll] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const filteredChecks = checks.filter(check =>
        check.shopName.toLowerCase().includes(search.toLowerCase())
    );

    const finalChecks = filteredChecks
        .filter(check => showAll ? true : check.date === today)
        .map(check => ({
            ...check,
            formattedDate: formatDate(check.date)
        }));

    const handleToggle = () => {
        setShowAll(prev => !prev);
    };

    return (
        <>
            <HistoryHeroSection
                search={search}
                setSearch={setSearch}
                onToggle={handleToggle}
                showAll={showAll}
            />

            <CheckList
                checks={finalChecks}
                showAll={showAll}
            />
        </>
    );
};

export default History;