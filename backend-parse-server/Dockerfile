FROM node:lts

# needed for puppeteer
RUN apt-get update
RUN apt-get -y install libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

EXPOSE 1337

# Uncomment if you want to access cloud code outside of your container
# A main.js file must be present, if not Parse will not start

# VOLUME /parse/cloud               

CMD [ "npm", "start" ]
