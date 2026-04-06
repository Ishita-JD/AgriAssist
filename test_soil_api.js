
// test_soil_api.js
const lon = 72.8777;
const lat = 19.0760;
const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=clay&property=sand&depth=0-5cm&value=mean`;

console.log(`📡 Fetching live soil data for Mumbai (Lon: ${lon}, Lat: ${lat})...`);

try {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'AgriAssist-Test/1.0'
        }
    });

    if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response body:", text);
    } else {
        const data = await response.json();
        console.log("✅ Data Received Successfully!");

        if (data.properties && data.properties.layers) {
            data.properties.layers.forEach(layer => {
                const value = layer.depths[0]?.values?.mean;
                const unit = layer.unit_measure?.target;
                console.log(`- ${layer.label || layer.name}: ${value} ${unit}`);
            });
        } else {
            console.log("⚠️ No layers found in response.");
        }
    }
} catch (error) {
    console.error(`❌ Fetch failed: ${error.message}`);
}
