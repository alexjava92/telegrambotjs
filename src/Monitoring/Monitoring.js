import axios from "axios";
import xml2js from "xml2js";


(async () => {
    try {
        const response = await axios.get('https://365cash.co/bestchange.xml');
        const result = await xml2js.parseStringPromise(response.data);

        const rates = result.rates.item;
        rates.sort((a, b) => a.to[0].localeCompare(b.to[0]));

        const filteredRates = rates.filter(rate => rate.to[0] === 'BTC' && rate.from[0] === 'SBERRUB');

        filteredRates.forEach(rate => {
            console.log(`From: ${rate.from[0]}, To: ${rate.to[0]}, Rate: ${rate.in[0]} to ${rate.out[0]}`);
        });
    } catch (error) {
        console.error(error);
    }
})();