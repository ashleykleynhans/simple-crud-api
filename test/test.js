'use strict';

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const User = require('../models/user'),
    Task = require('../models/task');

// Require the dev-dependencies
const chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server'),
    should = chai.should();

chai.use(chaiHttp);

let userId = '';

/**
 * User test cases
 */
describe('User', () => {
    // Empty the User collection before the tests execute
    before((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    /**
     * Create user test cases
     */
    describe('POST /api/users', () => {
       it('should not POST without a username field' , (done) => {
           let user = {
               first_name: 'John',
               last_name: 'Smith'
           };

           chai.request(server)
               .post('/api/users')
               .send(user)
               .end((err, res) => {
                   res.should.have.status(400);
                   res.body.should.be.a('object');
                   res.body.should.have.property('code').eql('InvalidContent');
                   done();
               });
       });

        it('should not POST without a first_name field' , (done) => {
            let user = {
                username: 'jsmith',
                last_name: 'Smith'
            };

            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('InvalidContent');
                    done();
                });
        });

        it('should not POST without a last_name field' , (done) => {
            let user = {
                username: 'jsmith',
                first_name: 'John'
            };

            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('InvalidContent');
                    done();
                });
        });

        it('should POST successfully with all fields provided' , (done) => {
            let user = {
                username: 'jsmith',
                first_name: 'John',
                last_name: 'Smith'
            };

            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    userId = res.body.id;
                    done();
                });
        });
    });

    /**
     * Update user test cases
     */
    describe('PUT /api/users/{id}', () => {
        it('should not PUT without a valid user id field', (done) => {
            let user = {
                first_name: 'John',
                last_name: 'Doe'
            };

            chai.request(server)
                .put('/api/users/iiii')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should PUT successfully with all fields provided', (done) => {
            let user = {
                first_name: 'John',
                last_name: 'Doe'
            };

            chai.request(server)
                .put('/api/users/' + userId)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    /**
     * List all users test cases
     */
    describe('GET /api/users', () => {
        it('should successfully GET a list of all users', (done) => {
            chai.request(server)
                .get('/api/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.gt(0);
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property('username').eql('jsmith');
                    done();
                });
        });
    });

    /**
     * Get user info test cases
     */
    describe('GET /api/users/{id}', () => {
        it('should not GET without a valid user id field', (done) => {
            chai.request(server)
                .get('/api/users/iiii')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should successfully GET user info for a specific user', (done) => {
            chai.request(server)
                .get('/api/users/' + userId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username').eql('jsmith');
                    done();
                });
        });
    });

});


/**
 * Task Test cases
 */
describe('Task', () => {
    // Empty the Task collection before the tests execute
    before((done) => {
        Task.remove({}, (err) => {
            done();
        });
    });

    let taskId = '';

    /**
     * Create task test cases
     */
    describe('POST /api/users/{user_id}/tasks', () => {
        it('should not POST without a valid user id field', (done) => {
            let task = {
                name: 'My task',
                description: 'Description of task',
                date_time: '2016-05-25 14:25:00'
            };

            chai.request(server)
                .post('/api/users/iiiiiii/tasks')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should not POST without a name field' , (done) => {
            let task = {
                description: 'Description of task',
                date_time: '2016-05-25 14:25:00'
            };

            chai.request(server)
                .post('/api/users/' + userId + '/tasks')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('InvalidContent');
                    done();
                });
        });

        it('should not POST without a description field' , (done) => {
            let task = {
                name: 'My task',
                date_time: '2016-05-25 14:25:00'
            };

            chai.request(server)
                .post('/api/users/' + userId + '/tasks')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('InvalidContent');
                    done();
                });
        });

        it('should not POST without a date_time field' , (done) => {
            let task = {
                name: 'My task',
                description: 'Description of task'
            };

            chai.request(server)
                .post('/api/users/' + userId + '/tasks')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('InvalidContent');
                    done();
                });
        });

        it('should POST successfully with all fields provided' , (done) => {
            let task = {
                name: 'My task',
                description: 'Description of task',
                date_time: '2016-05-25 14:25:00'
            };

            chai.request(server)
                .post('/api/users/' + userId + '/tasks')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    taskId = res.body.id;
                    done();
                });
        });
    });

    /**
     * Update task test cases
     */
    describe('PUT /api/users/{user_id}/tasks/{task_id}', () => {
        it('should not PUT without a valid user id field', (done) => {
            let task = {
                name: 'My task'
            };

            chai.request(server)
                .put('/api/users/iiiiiii/tasks/' + taskId)
                .send(task)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should not PUT without a valid task id field', (done) => {
            let task = {
                name: 'My task'
            };

            chai.request(server)
                .put('/api/users/' + userId + '/tasks/iiiiiiiiii')
                .send(task)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should PUT successfully with all fields provided', (done) => {
            let task = {
                name: 'My task'
            };

            chai.request(server)
                .put('/api/users/' + userId + '/tasks/' + taskId)
                .send(task)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    /**
     * Delete task test cases
     */
    describe('DELETE /api/users/{user_id}/tasks/{task_id}', () => {
        it('should not DELETE without a valid user id field', (done) => {
            chai.request(server)
                .delete('/api/users/iiiiiii/tasks/' + taskId)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should not DELETE without a valid task id field', (done) => {
            chai.request(server)
                .delete('/api/users/' + userId + '/tasks/iiiiiiiiii')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should DELETE successfully with all fields provided', (done) => {
            chai.request(server)
                .delete('/api/users/' + userId + '/tasks/' + taskId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    /**
     * Get task info test cases
     */
    describe('GET /api/users/{user_id}/tasks/{task_id}', () => {
        it('should not GET without a valid user id field', (done) => {
            chai.request(server)
                .get('/api/users/iiiiiii/tasks/' + taskId)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should not GET without a valid task id field', (done) => {
            chai.request(server)
                .get('/api/users/' + userId + '/tasks/iiiiiiiiii')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should successfully GET task info for a specific user id and task id', (done) => {
            chai.request(server)
                .get('/api/users/' + userId + '/tasks/' + taskId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('description').eql('Description of task');
                    done();
                });
        });
    });

    /**
     * List all tasks for a user test cases
     */
    describe('GET /api/users/{user_id}/tasks', () => {
        it('should not GET without a valid user id field', (done) => {
            chai.request(server)
                .get('/api/users/iiiiiii/tasks/' + taskId)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('ResourceNotFound');
                    done();
                });
        });

        it('should successfully GET all tasks for a specific user id', (done) => {
            chai.request(server)
                .get('/api/users/' + userId + '/tasks')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property('description').eql('Description of task');
                    done();
                });
        });
    });

});
