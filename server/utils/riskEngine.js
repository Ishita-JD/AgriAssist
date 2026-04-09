const SOIL_SUITABILITY = {
    rice: ['clay', 'clayey', 'loam', 'loamy'],
    wheat: ['loam', 'loamy', 'clay loam'],
    maize: ['loam', 'loamy', 'sandy loam'],
    cotton: ['black', 'black soil', 'clay', 'clayey'],
    onion: ['loam', 'loamy', 'sandy loam'],
    potato: ['loam', 'loamy', 'sandy loam'],
    sugarcane: ['loam', 'loamy', 'clay loam'],
    tomato: ['loam', 'loamy', 'sandy loam']
};

function isSoilSuitable(soilType, crop) {
    if (!soilType || !crop) {
        return true;
    }

    const cropKey = crop.toLowerCase().trim();
    const soilValue = soilType.toLowerCase().trim().replace(/_/g, ' ');
    const suitableSoils = SOIL_SUITABILITY[cropKey];

    if (!suitableSoils) {
        return true;
    }

    return suitableSoils.some((soil) => soilValue.includes(soil));
}

function calculateRisk({ weather = {}, marketTrend, soilType, crop }) {
    const rain = Number(weather.rain) || 0;
    const wind = Number(weather.wind) || 0;

    const soilSuitable = isSoilSuitable(soilType, crop);

    let weatherRisk = 30;
    if (rain > 60) weatherRisk += 30;
    if (wind > 20) weatherRisk += 20;

    const marketRisk = marketTrend === 'down' ? 70 : 30;
    const soilRisk = soilSuitable ? 20 : 80;

    const totalRiskScore = Math.round(
        (weatherRisk + marketRisk + soilRisk) / 3
    );

    let level = 'Low';
    if (totalRiskScore > 60) level = 'High';
    else if (totalRiskScore > 40) level = 'Medium';

    const reasons = [];
    if (rain > 60) reasons.push('heavy rain');
    if (wind > 20) reasons.push('strong wind');
    if (marketTrend === 'down') reasons.push('falling prices');
    if (!soilSuitable) reasons.push('unsuitable soil');

    const explanation = reasons.length > 0
        ? `${level} risk due to ${reasons.join(', ')}. Take precautions.`
        : `${level} risk. Conditions are stable for normal farming.`;

    return {
        weatherRisk,
        marketRisk,
        soilRisk,
        totalRiskScore,
        level,
        explanation
    };
}

module.exports = { calculateRisk };
