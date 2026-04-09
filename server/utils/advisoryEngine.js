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

function generateAdvisory({ weather = {}, marketTrend, soilType, crop }) {
    const weatherMsg = [];
    const marketMsg = [];
    const soilMsg = [];

    const rain = Number(weather.rain) || 0;
    const wind = Number(weather.wind) || 0;

    if (rain > 60) {
        weatherMsg.push('Delay irrigation due to high rain probability');
    }

    if (wind > 20) {
        weatherMsg.push('Avoid spraying due to high wind');
    }

    if (marketTrend === 'up') {
        marketMsg.push('Prices rising, consider waiting before selling');
    } else if (marketTrend === 'down') {
        marketMsg.push('Prices falling, consider selling soon');
    }

    if (!isSoilSuitable(soilType, crop)) {
        soilMsg.push('Soil may not be ideal for this crop');
    }

    const result = [...weatherMsg, ...marketMsg, ...soilMsg];

    if (result.length === 0) {
        result.push('Conditions look stable. Continue regular farming practices');
    }

    return result.slice(0, 3);
}

module.exports = { generateAdvisory };
