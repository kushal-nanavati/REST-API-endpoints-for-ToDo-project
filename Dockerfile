FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ARG DEFAULT_PORT 4000

ENV PORT $DEFAULT_PORT

EXPOSE $PORT

CMD ["npm","start"]

