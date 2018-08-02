FROM node:9

WORKDIR /home/node/app

COPY package.json .
RUN npm install --quiet

COPY . .