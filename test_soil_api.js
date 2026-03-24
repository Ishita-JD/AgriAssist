
const https = require('https');

function fetchSoil(lon, lat) {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=clay&property=sand&depth=0-5cm&value=mean`;

    console.log(`Fetching: ${url}`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(data);
                    console.log(JSON.stringify(json, null, 2));
                } catch (e) {
                    console.error('Failed to parse JSON');
                    console.log(data);
                }
            } else {
                console.error(`Status Code: ${res.statusCode}`);
                console.log(data);
            }
        });
    }).on('error', (err) => {
        console.error(`Error: ${err.message}`);
    });
}

fetchSoil(72.8777, 19.0760); // Mumbai
