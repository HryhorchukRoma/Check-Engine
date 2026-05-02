import HomeHeroSection from "../sections/HomeHeroSection";
import ScanSection from "../sections/ScanSection";
import CheckList from "../sections/CheckList";
import { checks } from "../data/checks";

const Home = () => {


    return (
        <>
            <HomeHeroSection />
            <ScanSection />
            <CheckList checks={checks.slice(-10)} />
        </>
    )
}

export default Home