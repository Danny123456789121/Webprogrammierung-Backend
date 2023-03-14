
const express = require('express');
const bodyParser = require('body-parser');

const index = express();

index.use(bodyParser.urlencoded({ extended: false }));
index.use(bodyParser.json());

index.get('/', (reg, res) =>{
    res.send('Hello World');
});

index.listen(8080, () => {
    console.log('Server is running on port 8080');
})