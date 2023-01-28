import fs from 'fs';
import path from 'path';

export interface EnvVariables {
    appName: string;
    databaseUri: string;
    appId: string;
    masterKey: string;
    port: number;
    serverUrl: string;
    dashboardUser: string;
    dashboardPass: string;
    dashboardHostnames: string[];
    randomStringForHash: string;
    production: boolean;
    smsServiceToken: string;
    smsServiceUrl: string;
}

export class EnvUtils {

    private static cachedEnv?: EnvVariables;
    public static appRoot: string;

    public static get(): EnvVariables {
        if (this.cachedEnv) {
            return this.cachedEnv;
        }

        if (!(process.env.USE_ENV_VARIABLE === 'true')) {
            // gather env variables from local ENV Variables
            return EnvUtils.getEnvVariablesFromHost();
        }
        // gather env variables from env.json file
        return EnvUtils.getEnvVariablesFromFile();
    }

    static getEnvVariablesFromHost(): EnvVariables {
        this.cachedEnv = {
            appName: process.env.APP_NAME,
            databaseUri: process.env.DATABASE_URL,
            appId: process.env.APP_ID,
            masterKey: process.env.MASTER_KEY,
            port: +(process.env.PORT || 0),
            serverUrl: process.env.SERVER_URL,
            dashboardUser: process.env.DASHBOARD_USER,
            dashboardPass: process.env.DASHBOARD_PASS,
            dashboardHostnames: process.env.DASHBOARD_HOSTNAMES?.split(','),
            randomStringForHash: process.env.RANDOM_STRING_FOR_HASH,
            production: process.env.PRODUCTION === 'true',
            smsServiceToken: process.env.SMS_SERVICE_TOKEN,
            smsServiceUrl: process.env.SMS_SERVICE_URL,
        } as EnvVariables;
        this.checkEnvVariables();
        return this.cachedEnv;
    }

    private static getEnvVariablesFromFile() {
        if (!this.appRoot) {
            throw 'The variable appRoot must be set in the EnvUtils.';
        }
        const envFilePath = path.join(this.appRoot, 'src', 'env.json');
        console.log('[EnvUtils] Loading env from file: ' + envFilePath);
        if (!fs.existsSync(envFilePath)) {
            throw `Could not find env file at ${envFilePath}. Create a new env.json file from the env.json.template.`;
        }
        const envFile = fs.readFileSync(envFilePath);
        const envString = envFile.toString();
        this.cachedEnv = JSON.parse(envString) as EnvVariables;
        this.checkEnvVariables();
        return this.cachedEnv;
    }

    public static reloadEnv(): EnvVariables {
        this.cachedEnv = undefined;
        return this.get();
    }

    private static checkEnvVariables() {
        const missingProps = Object.keys(this.cachedEnv ?? []).filter(x => !x);
        if (!this.cachedEnv || missingProps.length > 0) {
            throw 'The following env variables are not set: ' + missingProps.join(', ');
        }
    }
}
