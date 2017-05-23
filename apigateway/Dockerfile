FROM node:7.9.0-alpine
WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

EXPOSE 8080

USER nobody
CMD npm start
