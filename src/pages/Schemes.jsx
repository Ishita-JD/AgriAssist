import React from 'react';
import { Landmark, Banknote, ShieldCheck, BookOpen, Tractor, Leaf } from 'lucide-react';
import schemesBg from '../assets/indian_farmer_schemes.png';
import { useLanguage } from '../context/LanguageContext';

const Schemes = () => {
    const { t, lang } = useLanguage();

    const schemesData = [
        {
            icon: <Banknote size={32} />,
            title: lang === 'hi' ? 'पीएम-किसान' : 'PM-KISAN',
            badge: t('schBadges.income'),
            desc: lang === 'hi' 
                ? 'पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता, तीन समान किस्तों में सीधे बैंक खातों में स्थानांतरित।'
                : 'Direct income support of ₹6,000 per year to eligible farmer families, transferred directly to bank accounts in three equal instalments.',
            link: 'https://pmkisan.gov.in',
        },
        {
            icon: <ShieldCheck size={32} />,
            title: lang === 'hi' ? 'पीएम फसल बीमा योजना' : 'PM Fasal Bima Yojana',
            badge: t('schBadges.insurance'),
            desc: lang === 'hi'
                ? 'प्राकृतिक आपदाओं, कीटों और बीमारियों के कारण बुवाई से पहले और कटाई के बाद के नुकसान को कवर करने वाली व्यापक फसल बीमा योजना।'
                : 'Comprehensive crop insurance scheme covering pre-sowing to post-harvest losses due to natural calamities, pests, and diseases.',
            link: 'https://pmfby.gov.in',
        },
        {
            icon: <Tractor size={32} />,
            title: lang === 'hi' ? 'पीएमकेएसवाई' : 'PMKSY',
            badge: t('schBadges.irrigation'),
            desc: lang === 'hi'
                ? 'प्रधानमंत्री कृषि सिंचाई योजना सूक्ष्म सिंचाई, जलसंभर विकास और जल दक्षता के माध्यम से हर खेत को पानी सुनिश्चित करती है।'
                : 'Pradhan Mantri Krishi Sinchai Yojana ensures water to every farm through micro-irrigation, watershed development, and water efficiency.',
            link: 'https://pmksy.gov.in',
        },
        {
            icon: <Leaf size={32} />,
            title: lang === 'hi' ? 'मृदा स्वास्थ्य कार्ड' : 'Soil Health Card',
            badge: t('schBadges.soil'),
            desc: lang === 'hi'
                ? 'किसानों को उनकी मिट्टी की पोषक स्थिति के बारे में जानकारी प्रदान करता है और उत्पादकता में सुधार के लिए पोषक तत्वों की उचित खुराक की सिफारिश करता है।'
                : 'Provides farmers with information on their soil\'s nutrient status and recommends appropriate dosages of nutrients to improve productivity.',
            link: 'https://soilhealth.dac.gov.in',
        },
        {
            icon: <BookOpen size={32} />,
            title: lang === 'hi' ? 'ई-नाम' : 'e-NAM',
            badge: t('schBadges.market'),
            desc: lang === 'hi'
                ? 'नेशनल एग्रीकल्चर मार्केट — कृषि वस्तुओं के लिए एक ऑनलाइन ट्रेडिंग प्लेटफॉर्म, जो किसानों को सीधे पूरे भारत में खरीदारों से जोड़ता है।'
                : 'National Agriculture Market — an online trading platform for agricultural commodities, connecting farmers directly to buyers across India.',
            link: 'https://enam.gov.in',
        },
        {
            icon: <Landmark size={32} />,
            title: lang === 'hi' ? 'केसीसी योजना' : 'KCC Scheme',
            badge: t('schBadges.credit'),
            desc: lang === 'hi'
                ? 'किसान क्रेडिट कार्ड फसल की खेती के खर्च, कटाई के बाद के खर्च और संबद्ध गतिविधियों को पूरा करने के लिए अल्पकालिक क्रेडिट प्रदान करता है।'
                : 'Kisan Credit Card provides short-term credit to meet crop cultivation expenses, post-harvest expenses, and allied activities.',
            link: 'https://www.nabard.org',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                height: '420px',
                backgroundImage: `url(${schemesBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(10,20,50,0.6) 0%, rgba(30,60,30,0.5) 100%)'
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏛️</div>
                    <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('schHeroTitle')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {t('schHeroSubtitle')}
                    </p>
                </div>
            </div>

            {/* Scheme Cards */}
            <div style={{ padding: '4rem 4rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="feature-grid">
                    {schemesData.map((s) => (
                        <div key={s.title} className="feature-card" style={{ position: 'relative', paddingTop: '2rem' }}>
                            <span style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(74,222,128,0.15)', color: 'var(--accent-green)',
                                fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem',
                                borderRadius: '999px', border: '1px solid rgba(74,222,128,0.3)',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>{s.badge}</span>
                            <div className="feature-icon">{React.cloneElement(s.icon, { className: 'icon-svg' })}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                            <a
                                href={s.link} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block', marginTop: '1rem',
                                    color: 'var(--accent-green)', fontSize: '0.9rem',
                                    fontWeight: 600, textDecoration: 'none',
                                    borderBottom: '1px solid rgba(74,222,128,0.4)',
                                    paddingBottom: '2px'
                                }}
                            >
                                {t('btnLearnMore')} →
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schemes;
