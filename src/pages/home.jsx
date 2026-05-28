import HomeHeroSection from "../sections/HomeHeroSection";
import ScanSection from "../sections/ScanSection";
import CheckList from "../sections/CheckList";
import { checks } from "../data/checks";

const Home = () => {

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