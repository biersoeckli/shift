FROM node:lts-bullseye

# needed for puppeteer
RUN apt-get update
RUN apt-get -y install libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm-dev

# needed for database backup
#RUN wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian11-x86_64-100.6.1.deb && \
#    apt install ./mongodb-database-tools-*.deb && \
#    rm -f mongodb-database-tools-*.deb

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install
RUN npm run build
RUN rm -rf ./src
RUN rm -rf ./spec

EXPOSE 1337

CMD [ "npm", "start-no-build" ]
