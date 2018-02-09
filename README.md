### NodeJS RESTful API to manage users and tasks

This demo is built using MongoDB and NodeJS 8.9.4 (the current LTS release).

## Assumptions

* This is for demo purposes, so there is no authentication/security built in.

## Generating API Documentation

`npm install apidoc -g`

`apidoc -e node_modules`

Open the **docs/index.html** file in your web browser.

## Requirements

* Docker (https://www.docker.com/community-edition#/download)
* Docker Compose (https://docs.docker.com/compose/)

## Installation

1. Clone the repo
2. Start the Docker containers, which will download and install all the required software

        docker-compose up
    
3. The API listens for incoming connections at http://127.0.0.1:3000

## Testing

Tests can be run in the Docker container as follows

    docker-compose run app mocha


## Job Scheduler

The job scheduler can be run as follows

    docker-compose run app node scheduler/task.js