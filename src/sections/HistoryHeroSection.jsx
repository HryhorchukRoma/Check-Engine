
import '../styles/sections/history-hero-section.scss';

const HistoryHeroSection = ({ search, setSearch, onToggle, showAll }) => {

    return (
        <>
            <section className='history-hero-section'>
                <h1 className='history-hero-section__title'>Історія чеків</h1>
                <div className='container'>
                    <div className='history-hero-section__search'>
                        <svg className='history-hero-section__search-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 14.4722C16.2275 13.3736 17 11.777 17 10C17 6.68629 14.3137 4 11 4C7.68629 4 5 6.68629 5 10C5 13.3137 7.68629 16 11 16C12.5367 16 13.9385 15.4223 15 14.4722ZM15 14.4722L19.5278 19" stroke="#9B8BB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className='history-hero-section__search-input'
                            placeholder='Пошук за магазином'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button onClick={onToggle} className='history-hero-section__all'>
                        <svg className='history-hero-section__icon' xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.59293 20.258L9.58193 20.26L9.51093 20.295L9.49093 20.299L9.47693 20.295L9.40593 20.26C9.39526 20.2567 9.38726 20.2583 9.38193 20.265L9.37793 20.275L9.36093 20.703L9.36593 20.723L9.37593 20.736L9.47993 20.81L9.49493 20.814L9.50693 20.81L9.61093 20.736L9.62293 20.72L9.62693 20.703L9.60993 20.276C9.60726 20.2653 9.60159 20.2593 9.59293 20.258ZM9.85793 20.145L9.84493 20.147L9.65993 20.24L9.64993 20.25L9.64693 20.261L9.66493 20.691L9.66993 20.703L9.67793 20.71L9.87893 20.803C9.89159 20.8063 9.90126 20.8037 9.90793 20.795L9.91193 20.781L9.87793 20.167C9.87459 20.155 9.86793 20.1477 9.85793 20.145ZM9.14293 20.147C9.13852 20.1443 9.13325 20.1435 9.12822 20.1446C9.12319 20.1457 9.11879 20.1487 9.11593 20.153L9.10993 20.167L9.07593 20.781C9.07659 20.793 9.08226 20.801 9.09293 20.805L9.10793 20.803L9.30893 20.71L9.31893 20.702L9.32293 20.691L9.33993 20.261L9.33693 20.249L9.32693 20.239L9.14293 20.147Z" fill="#9B8BB4" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 1.5C0 1.10218 0.158035 0.720644 0.43934 0.43934C0.720644 0.158035 1.10218 0 1.5 0H16.5C16.8978 0 17.2794 0.158035 17.5607 0.43934C17.842 0.720644 18 1.10218 18 1.5V3.586C17.9999 4.11639 17.7891 4.62501 17.414 5L12 10.414V17.838C12 18.0255 11.9521 18.2099 11.8608 18.3737C11.7695 18.5375 11.6379 18.6753 11.4783 18.7739C11.3188 18.8724 11.1368 18.9286 10.9494 18.9371C10.7621 18.9455 10.5757 18.9059 10.408 18.822L6.691 16.964C6.48337 16.8602 6.30875 16.7006 6.1867 16.5031C6.06466 16.3057 6.00001 16.0781 6 15.846V10.414L0.586 5C0.210901 4.62501 0.000113275 4.11639 0 3.586V1.5ZM2 2V3.586L7.56 9.146C7.69945 9.28527 7.81008 9.45066 7.88558 9.63272C7.96108 9.81477 7.99996 10.0099 8 10.207V15.382L10 16.382V10.207C10 9.809 10.158 9.427 10.44 9.147L16 3.585V2H2Z" fill="#9B8BB4" />
                        </svg>
                        {showAll ? "Чеки за сьогодні" : "Усі чеки"}
                        <svg className='history-hero-section__arrow' xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6" fill="none">
                            <path d="M0.5 0.500061L6 4.50006L11.5 0.500061" stroke="#9B8BB4" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </section>
        </>
    )
}

export default HistoryHeroSection