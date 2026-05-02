
import '../styles/sections/home-hero-section.scss';

const HomeHeroSection = () => {
    return (
        <section className="home-hero-section">
            <div className='container'>
                <img className='home-hero-section__logo' src="/src/assets/icons/logo.svg" alt="" />
                <h1 className='home-hero-section__name'>CheckEngine</h1>
            </div>
        </section>
    );
};

export default HomeHeroSection;