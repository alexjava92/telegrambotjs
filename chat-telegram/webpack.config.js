const path = require('path');


module.exports = {
    entry: './chat-gpt.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};

