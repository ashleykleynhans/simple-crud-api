'use strict';

/**
 * Configuration file
 */

module.exports = {
    name: 'Basic CRUD Test',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://mongo:27017/api',
    },
};