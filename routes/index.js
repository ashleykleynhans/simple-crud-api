'use strict';

/**
 * Module Dependencies
 */
const errors = require('restify-errors'),
_ = require('lodash');

/**
 * Model Schemas
 */
const mongoose = require('mongoose'),
    User = require('../models/user'),
    Task = require('../models/task');

module.exports = function(server) {
    /**
     * @api {post} /api/users
     * @apiName Create user endpoint
     * @apiDescription Receives data via an API POST request and stores in the users collection
     * @apiGroup Users
     *
     * @apiParam {String} username Unique Username
     * @apiParam {String} first_name First name of the user
     * @apiParam {String} last_name Last name of the user
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Content-Type: application/json" -X POST -d '{"username":"jsmith","first_name" : "John", "last_name" : "Smith"}' http://hostname/api/users
     */
    server.post({url: '/api/users', validation: {
        content: {
            username: { isRequired: true },
            first_name: { isRequired: true },
            last_name: { isRequired: true }
        }
    }}, (req, res, next) => {
        // Validate content type
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        let data = req.body || {};
        let user = new User(data);

        user.save(function(err) {
            if (err) {
                console.error(err);
                return next(new errors.InternalError(err.message));
                next();
            }

            data.id = user._id;

            // Return HTTP 201 - Created response
            res.send(201, data);
            next();
        });
    });


    /**
     * @api {put} /api/users/{id}
     * @apiName Update user endpoint
     * @apiDescription Receives data from API PUT request and updates the record in the users collection
     * @apiGroup Users
     *
     * @apiParam {String} id User ID of the User to be updated
     * @apiParam {String} [username] Unique Username
     * @apiParam {String} [first_name] First name of the user
     * @apiParam {String} [last_name] Last name of the user
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Content-Type: application/json" -X PUT -d '{"first_name" : "John", "last_name" : "Doe"}' http://hostname/api/users/{id}
     */
    server.put('/api/users/:user_id', (req, res, next) => {
        // Validate content type
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        // Valiidate that the user id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        let data = req.body || {};
        data = Object.assign({}, data, {_id: req.params.user_id});

        User.findOne({ _id: req.params.user_id }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            User.update({ _id: data._id }, data, function(err) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                }

                data = _.merge(doc, data);

                res.send(200, _.pick(data, ['username', 'first_name', 'last_name']));
                next();
            });
        });
    });


    /**
     * @api {get} /api/users
     * @apiName List all users endpoint
     * @apiDescription Retrieves all users from the users collection and lists them
     * @apiGroup Users
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/api/users
     */
    server.get('/api/users', (req, res, next) => {
        // Pagination
        let limit = Math.abs(req.query.limit) || 100;
        let page = (Math.abs(req.query.page) || 1) - 1;

        User.find()
            .limit(limit)
            .skip(limit * page)
            .exec(function(err, docs) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }

            let responseData = [];

            docs.forEach(doc => {
                doc.id = doc._id;
                // Only pick the relevant fields to ensure that passwords etc aren't returned
                responseData.push(_.pick(doc, ['username', 'first_name', 'last_name', 'created_at', 'updated_at', 'id']));
            });

            res.send(200, responseData);
            next();
        });
    });


    /**
     * @api {get} /api/users/{id}
     * @apiName Get user info endpoint
     * @apiDescription Retrieves the specified user information from the users collection
     * @apiGroup Users
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/api/users/{id}
     */
    server.get('/api/users/:user_id', (req, res, next) => {
        // Validate that the user id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        User.findOne({ _id: req.params.user_id }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            // Only pick the relevant fields to ensure that passwords etc aren't returned
            let responseData = _.pick(doc, ['username', 'first_name', 'last_name', 'created_at', 'updated_at']);
            responseData.id = doc.id;

            res.send(200, responseData);
            next();
        });
    });


    /**
     * @api {post} /api/users/{user_id}/tasks
     * @apiName Create task endpoint
     * @apiDescription Receives data via an API POST request and stores in the tasks collection
     * @apiGroup Users
     *
     * @apiParam {String} name Name of task
     * @apiParam {String} description Description of task
     * @apiParam {String} date_time
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Content-Type: application/json" -X POST -d '{"name":"My task","description" : "Description of task", "date_time" : "2016-05-25 14:25:00"}' http://hostname/api/users/{user_id}/tasks
     */
    server.post({url: '/api/users/:user_id/tasks', validation: {
        content: {
            name: { isRequired: true },
            description: { isRequired: true },
            date_time: { isRequired: true },
        }
    }}, (req, res, next) => {
        // Valiidate that the user id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        User.findOne({ _id: req.params.user_id }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            // Validate content type
            if (!req.is('application/json')) {
                return next(
                    new errors.InvalidContentError("Expects 'application/json'"),
                );
            }

            let data = req.body || {};
            data.user_id = req.params.user_id;

            let task = new Task(data);

            task.save(function(err) {
                if (err) {
                    console.error(err);
                    return next(new errors.InternalError(err.message));
                    next();
                }

                data.id = task._id;

                // Return HTTP 201 - Created response
                res.send(201, data);
                next();
            });
        });
    });

    /**
     * @api {put} /api/users/{user_id}/tasks/{task_id}
     * @apiName Update task endpoint
     * @apiDescription Receives data via an API PUT request and updates in the tasks collection
     * @apiGroup Users
     *
     * @apiParam {String} [name] Name of task
     * @apiParam {String} [description] Description of task
     * @apiParam {String} [date_time]
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Content-Type: application/json" -X PUT -d '{"name":"My updated task"}' http://hostname/api/users/{user_id}/tasks/{task_id}
     */
    server.put('/api/users/:user_id/tasks/:task_id', (req, res, next) => {
        // Validate that the user id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        // Validate that the task id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.task_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'Task not found.',
                ),
            );
        }

        User.findOne({ _id: req.params.user_id }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            // Validate content type
            if (!req.is('application/json')) {
                return next(
                    new errors.InvalidContentError("Expects 'application/json'"),
                );
            }

            let data = req.body || {};
            data = Object.assign({}, data, {_id: req.params.task_id});

            Task.findOne({ _id: req.params.task_id }, function(err, doc) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                } else if (!doc) {
                    return next(
                        new errors.ResourceNotFoundError(
                            'Task not found.',
                        ),
                    );
                }

                Task.update({ _id: data._id }, data, function(err) {
                    if (err) {
                        console.error(err);
                        return next(
                            new errors.InvalidContentError(err.errors.name.message),
                        );
                    }

                    data = _.merge(doc, data);

                    res.send(200, _.pick(data, ['name', 'description', 'date_time']));
                    next();
                });
            });
        });
    });

    /**
     * @api {delete} /api/users/{user_id}/tasks/{task_id}
     * @apiName Delete task endpoint
     * @apiDescription Receives data via an API DELETE request and deletes in the tasks collection
     * @apiGroup Users
     *
     * @apiParam {String} [name] Name of task
     * @apiParam {String} [description] Description of task
     * @apiParam {String} [date_time]
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Content-Type: application/json" -X DELETE http://hostname/api/users/{user_id}/tasks/{task_id}
     */
    server.del('/api/users/:user_id/tasks/:task_id', (req, res, next) => {
        // Validate that the user id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        // Validate that the task id is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.task_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'Task not found.',
                ),
            );
        }

        User.findOne({ _id: req.params.user_id }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            Task.findOne({ _id: req.params.task_id }, function(err, doc) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                } else if (!doc) {
                    return next(
                        new errors.ResourceNotFoundError(
                            'Task not found.',
                        ),
                    );
                }

                // Soft delete, set the status to deleted instead of removing from the entry from the DB
                let data = { 'status': 'deleted' };
                data = Object.assign({}, data, {_id: req.params.task_id});

                Task.update({ _id: data._id }, data, function(err) {
                    if (err) {
                        console.error(err);
                        return next(
                            new errors.InvalidContentError(err.errors.name.message),
                        );
                    }

                    res.send(200);
                    next();
                });
            });
        });
    });

    /**
     * @api {get} /api/users/{user_id}/tasks/{task_id}
     * @apiName Get task info endpoint
     * @apiDescription Retrieves the task info from the Tasks collection for a specified user id and task id
     * @apiGroup Users
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/api/users/{user_id}/tasks/{task_id}
     */
    server.get('/api/users/:user_id/tasks/:task_id', (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.task_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'Task not found.',
                ),
            );
        }

        User.findOne({_id: req.params.user_id}, function (err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            Task.findOne({_id: req.params.task_id}, function (err, doc) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                } else if (!doc) {
                    return next(
                        new errors.ResourceNotFoundError(
                            'Task not found.',
                        ),
                    );
                }

                res.send(200, doc);
                next();
            });
        });
    });

    /**
     * @api {get} /api/users/{user_id}/tasks
     * @apiName List all tasks for a user endpoint
     * @apiDescription List all tasks for a user for a specified user id
     * @apiGroup Users
     *
     * @apiExample {curl} Example usage:
     *      curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://hostname/api/users/{user_id}/tasks
     */
    server.get('/api/users/:user_id/tasks', (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
            return next(
                new errors.ResourceNotFoundError(
                    'User not found.',
                ),
            );
        }

        User.findOne({_id: req.params.user_id}, function (err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'User not found.',
                    ),
                );
            }

            // Pagination
            let limit = Math.abs(req.query.limit) || 100;
            let page = (Math.abs(req.query.page) || 1) - 1;

            Task.find({user_id: req.params.user_id})
                .limit(limit)
                .skip(limit * page)
                .exec(function (err, docs) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                } else if (!docs) {
                    return next(
                        new errors.ResourceNotFoundError(
                            'No tasks found.',
                        ),
                    );
                }

                res.send(200, docs);
                next();
            });
        });
    });

};