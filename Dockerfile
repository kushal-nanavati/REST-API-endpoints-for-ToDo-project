FROM node:21

WORKDIR /app

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node","./dist/src/server.js"]

