import 'reflect-metadata';
import express from "express";
import path from "path";
import http from "http"
import { CronJobConfigurator } from "./jobs/cron-job.config";
import { IpFilterUtil } from "./common/utils/ip-filter.utils";
import { EnvUtils } from "./common/utils/env.utils";
import Container from 'typedi';
import { ApplicationUpdateJob } from './jobs/application-update.job';
const ParseServer = require('parse-server').ParseServer;

EnvUtils.appRoot = __dirname.replace('build', '');
const { appName, databaseUri, appId, masterKey, serverUrl, port, dashboardUser, dashboardPass, dashboardHostnames } = EnvUtils.get();
IpFilterUtil.setupHostnames(dashboardHostnames);

const parseServerApp = new ParseServer({
  databaseURI: databaseUri,
  cloud: path.join(__dirname, 'cloud-functions', 'main.js'),
  appId: appId,
  masterKey: masterKey,
  serverURL: serverUrl,
  liveQuery: {
    classNames: [],
  },
});

const ParseDashboard = require('parse-dashboard');
const users = !dashboardUser || !dashboardPass ? undefined : [
  {
    user: dashboardUser,
    pass: dashboardPass,
  },
];
const parseDashboardApp = new ParseDashboard({
  "apps": [
    {
      "serverURL": serverUrl,
      "appId": appId,
      "masterKey": masterKey,
      "appName": appName,
      production: true,
    }
  ],
  users,
  useEncryptedPasswords: false,
});

const app = express();
app.use('/parse', parseServerApp);
app.use('/dashboard', async (req, res, next) => {
  const forwardedForIp = req.headers.forwarded;
  if (!await IpFilterUtil.ipIsValid(forwardedForIp || req.ip)) {
    res.status(403).send({ "error": "unauthorized" });
  } else {
    next();
  }
});
app.use('/dashboard', parseDashboardApp);
app.get('/', (req, res) => {
  res.status(403).send({ "error": "unauthorized" });
});

const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log(`${appName} running on port ${port}.`);
});

// enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

IpFilterUtil.updateAllIpAddressesForHostnames();
CronJobConfigurator.configure();
