FROM node:latest
LABEL Name=stickerapp Version=0.19.0 
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && mv /tmp/node_modules /usr/src
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN /usr/src/node_modules/.bin/gulp build
EXPOSE 3000
EXPOSE 5858
CMD npm start
