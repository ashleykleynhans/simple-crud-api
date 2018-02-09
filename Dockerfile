FROM node:latest

WORKDIR /api
ADD . /api
RUN cd /api; npm install > /dev/null 2>&1
RUN cd /api; npm install -g mocha > /dev/null 2>&1

EXPOSE 3000
CMD ["npm", "start"]
