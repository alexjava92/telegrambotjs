import * as https from "https";
import xml2js from "xml2js";

https.get('https://kassa.cc/valuta.xml', (res) => {
    let data = '';

    // A chunk of data has been received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {
        xml2js.parseString(data, function(err, result) {
            if(err) {
                console.error(err);
            } else {
                let items = result['root']['item'];
                for(let i = 0; i < items.length; i++) {
                    console.log(items[i]);
                }
            }
        });
    });

}).on('error', (err) => {
    console.error("Error: " + err.message);
});