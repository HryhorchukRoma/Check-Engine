import React from "react";
import HomeHeroSection from "../sections/HomeHeroSection";
import ScanSection from "../sections/ScanSection";
import CheckList from "../sections/CheckList";
import { receiptService } from "../services/checkEngineService";
import { useEffect } from "react";

const Home = () => {
    const [checks, setChecks] = React.useState([]);
    useEffect(() => {
        const fetchChecks = async () => {
            try {
                const data = await receiptService.getReceipts();
                setChecks(data);
            }    
            catch (error) {
                console.error("Помилка при завантаженні чеків:", error);
            }
        };

        fetchChecks();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const latestChecks = checks
        .slice(-10)
        .map(check => ({
            ...check,
            formattedDate: formatDate(check.date)
        }));

    return (
        <>
            <HomeHeroSection />
            <ScanSection />

            <CheckList checks={latestChecks} />
        </>
    )
}

export default Home;