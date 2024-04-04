FROM node:lts-bullseye as build

ADD . /app

# build frontend
WORKDIR /app/frontend-angular
# set env varaiables for frontend
ENV IS_PRODUCTION=true
ENV PARSE_APP_ID=shift-planner
ENV PARSE_SERVER_URL=/parse
RUN npm install
RUN npm run build-prod-docker

#build backend
WORKDIR /app/backend-parse-server
RUN npm install
RUN npm run build
RUN rm -rf ./src
RUN rm -rf ./spec


FROM node:lts-bullseye as final
# set timezone
RUN apt install tzdata -y
ENV TZ="Europe/Zurich"

# needed for puppeteer
RUN apt-get update && apt-get -y install libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm-dev

RUN mkdir /app
WORKDIR /app
COPY --from=build /app/backend-parse-server /app
COPY --from=build /app/frontend-angular/dist/shift /app/frontend

ENV APP_ID=shift-planner
ENV APP_NAME=shift
ENV USE_ENV_VARIABLE=true
ENV PORT=1337

CMD [ "npm", "run", "start-no-build" ]
