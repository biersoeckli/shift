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
        if (!this.appRoot) {
            throw 'The variable appRoot must be set in the EnvUtils.';
        }

        const envFilePath = path.join(this.appRoot, 'src', 'env.json');
        console.log('[EnvUtils] Loading env from file: ' + envFilePath);
        if (!fs.existsSync(envFilePath)) {
            throw `Could not find env file at ${envFilePath}. Create a new env.json file from the env.json.template.`;
        }
        const envFile = fs.readFileSync(envFilePath);
        const envString = envFile.toString()
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
