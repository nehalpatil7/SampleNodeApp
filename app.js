const express = require('express');
const axios = require('axios');
const fs = require('fs');
const morgan = require('morgan')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
require("isomorphic-fetch");

const app = express();
const host = 'localhost';
const port = process.env.port || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//logging setup
var accessLogStream = fs.createWriteStream(path.join('./logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// view engine setup
app.set('views', [path.join(__dirname, 'views'),
    path.join(__dirname, '/views')
]);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'pug', 'ejs', 'html');

// api calls
app.get('/', (req, res, next) => {
    res.status(200).send(req.query);
    logger.info(`Server responsed with no resouces & request query = ${JSON.stringify(req.query)} to Ip-${req.ip}`);
});

app.post('/?', (req, res, next) => {
    if (req.query.name == "Nehal" && req.query.pwd == "12345") {
        res.status(200).send('User Authorized !');
        logger.info(`Server responsed with no resouces but user authorized & request query = ${JSON.stringify(req.query)} to Ip-${req.ip}`);
    } else {
        // res.status(401).send('Username & Password Both Required');
        res.status(401).send("User Unauthorized");
        logger.info(`Server responsed with no resouces but user unauthorized & request query = ${JSON.stringify(req.query)} to Ip-${req.ip}`);
    }
});

//app start/landing page
app.get('/form-with-post', (req, res) => {
    logger.info(`Server responsed with no resouces but user authorized & request query = ${JSON.stringify(req.query)} to Ip-${req.socket.remoteAddress}`);
    res.status(200).render('form-with-post');
});

//post landing page for routes
app.post('/success', (req, res) => {
    const apiUrl = 'https://vict3odkfb.execute-api.us-east-2.amazonaws.com/newstage/games';
    axios.get(apiUrl)
        .then(response => {
            const jsonData = response?.data;
            const searchTerm = req?.body?.searchTerm;
            const filteredData = jsonData.games.filter(game =>
                game.name.toLowerCase().includes(searchTerm?.toLowerCase())
            );
            res.status(200).render(`success`, {
                data: req?.body,
                filteredData: filteredData
            });
            logger.info(`/success rendered to IP-${req.socket.remoteAddress}`);
        })
        .catch(error => {
            console.error('Error fetching data:', error.message);
        });
});

//listening setup
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    logger.info(`Server started and running on http://${host}:${port}`);
});