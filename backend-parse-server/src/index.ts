import 'reflect-metadata';
import express from "express";
import path from "path";
import http from "http"
import { CronJobConfigurator } from "./jobs/cron-job.config";
import { IpFilterUtil } from "./common/utils/ip-filter.utils";
import { EnvUtils } from "./common/utils/env.utils";
import { StaticPathConstants } from './common/constants/static-paths.constants';
import { FsUtils } from './common/utils/fs.utils';
const ParseServer = require('parse-server').ParseServer;
var FSFilesAdapter = require('@parse/fs-files-adapter');

EnvUtils.appRoot = __dirname.replace('build', '');
const { appName, databaseUri, appId, masterKey, serverUrl, port, dashboardUser, dashboardPass, dashboardHostnames } = EnvUtils.get();
IpFilterUtil.setupHostnames(dashboardHostnames);
FsUtils.createDirIfNotExists(StaticPathConstants.getPublicDataFilePath());
FsUtils.createDirIfNotExists(StaticPathConstants.getVolunteerContractFilePath());

var fsAdapter = new FSFilesAdapter({
  // "filesSubDirectory": "my/files/folder", // optional, defaults to ./files
  // "encryptionKey": "someKey" //optional, but mandatory if you want to encrypt files
});

const parseServerApp = new ParseServer({
  databaseURI: databaseUri,
  cloud: path.join(__dirname, 'cloud-functions', 'main.js'),
  appId: appId,
  masterKey: masterKey,
  serverURL: serverUrl,
  filesAdapter: fsAdapter,
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
  const forwardedForIp = req.headers['x-forwarded-for'] as string;
  if (!await IpFilterUtil.ipIsValid(forwardedForIp || req.ip)) {
    res.status(403).send({ "error": "unauthorized" });
  } else {
    next();
  }
});

app.use('/dashboard', parseDashboardApp);
app.use(StaticPathConstants.publicDataUrlPath, express.static(StaticPathConstants.getPublicDataFilePath()))
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
