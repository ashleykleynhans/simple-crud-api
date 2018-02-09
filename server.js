'use strict';

/**
 * Include Module Dependencies
 */
const config = require('./config'),
    restify = require('restify'),
    mongoose = require('mongoose'),
    restifyPlugins = require('restify-plugins'),
    restifyValidation = require('node-restify-validation'),
    errors = require('restify-errors');

/**
 * Initialise the Restify Server
 */
const server = restify.createServer({
    name: config.name,
    version: config.version,
});

/**
 * Set up Restify Middleware
 */
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.bodyParser());
server.use(restifyValidation.validationPlugin( {
    // Shows errors as an array
    errorsAsArray: false,
    // Not exclude incoming variables not specified in validator rules
    forbidUndefinedVariables: false,
    errorHandler: errors.InvalidContentError
}));

/**
 * Start the Restify Server, Connect to MongoDB and Setup Routes
 */
server.listen(config.port, () => {
    // Establish connection to MongoDB
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.uri);

    const db = mongoose.connection;

    // If the DB connection fails, log the end exit
    db.on('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    // Once the DB is connected, set up API routes and listen for incoming connections
    db.once('open', () => {
        require('./routes')(server);
        console.log(`Server is listening on port ${config.port}`);
    });
});

module.exports = server;