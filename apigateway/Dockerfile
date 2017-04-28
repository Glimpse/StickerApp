FROM node:latest
LABEL Name=stickerapp-apigateway Version=0.1.0 
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && mv /tmp/node_modules /usr/src
WORKDIR /usr/src/app
COPY . /usr/src/app
EXPOSE 3000
EXPOSE 5859
CMD npm start
