FROM node:20-bullseye as build

ADD . /app

# build frontend
WORKDIR /app/frontend-angular
# set env varaiables for frontend
ENV IS_PRODUCTION=true
ENV PARSE_APP_ID=shift-planner
ENV PARSE_SERVER_URL=/parse
RUN npm install
RUN npm run build-prod-docker

FROM node:20-bullseye as final

WORKDIR /app

# set timezone
RUN apt install tzdata -y
ENV TZ="Europe/Zurich"

ADD ./backend-parse-server /app
COPY --from=build /app/frontend-angular/dist/shift /app/frontend

# needed for puppeteer
RUN apt-get update && apt-get -y install libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm-dev

#build backend
RUN npm install
RUN npm run build
RUN rm -rf ./src && rm -rf ./spec

ENV APP_ID=shift-planner
ENV APP_NAME=shift
ENV USE_ENV_VARIABLE=true
ENV PORT=1337

CMD [ "npm", "run", "start-no-build" ]
