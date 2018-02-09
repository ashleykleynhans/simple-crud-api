'use strict';

/**
 * Scheduled job to check all tasks in the Database - those that have a status of "pending"
 * and next_execute_date_time has passed - print it to the console and update the task to "done".
 */

const config = require('../config'),
    mongoose = require('mongoose'),
    logger = require('winston'),
    moment = require('moment'),
    schedule = require('node-schedule'),
    Task = require('../models/task');

// Set up logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    'timestamp': function() {
        return moment().format('HH:mm:ss');
    },
    'colorize': true,
    'level': 'debug',
});

logger.debug('Job scheduler started - checking for jobs every 30 minutes\n');

// Check for pending tasks every 30 minutes
const job = schedule.scheduleJob('*/30 * * * *', () => {

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
        Task.find({
            status: 'pending',
            'next_execute_date_time': {
                $lt: Date.now()
            }
        })
            .exec(function (err, docs) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }

                // Looop over each task that is pending and print it to the console and update it to done in the db
                docs.forEach(task => {
                    logger.info('Name: ' + task.name);
                    logger.info('Description: ' + task.description);
                    logger.info('Date: ' + task.date_time);
                    logger.info('User ID: ' + task.user_id);
                    logger.info('----------------------------\n ');

                    task.status = 'done';

                    task.save(function (err, updatedTask) {
                        if (err) {
                            console.error(err);
                        }
                    });
                });
            });

    });

});