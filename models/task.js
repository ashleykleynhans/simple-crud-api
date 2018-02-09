'use strict';

/**
 * Task Schema - defines the MongoDB Schema for the Task Collection
 */

const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

const TaskSchema = new mongoose.Schema(
    {
        user_id: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        date_time: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ['pending', 'done', 'deleted'],
            default: 'pending',
            required: true,
        },

        next_execute_date_time: {
            type: Date,
            required: true,
            default: Date.now,
        }

    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;