'use strict';

/**
 * User Schema - Defines the MongoDB Schema for the User Collection
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        first_name: {
            type: String,
            required: true,
            trim: true,
        },

        last_name: {
            type: String,
            required: true,
            trim: true,
        },

    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;