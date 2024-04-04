import { EnvUtils } from "./env.utils";

export class CloudCodeTriggerService {

    static async runCloudJob(jobName: string) {
        if (!jobName) {
            return;
        }
        try {
            const requestUrl = EnvUtils.get().serverUrl + '/jobs/' + jobName;
            console.log(`Triggering cloud Job ${jobName} => "${requestUrl}"...`);
            /*
                    const response = await fetch(requestUrl, {
                        method: 'POST',
                        headers: {
                            'X-Parse-Application-Id': appId,
                            'X-Parse-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        body: {}
                    });*/
            const response = await Parse.Cloud.httpRequest({
                url: requestUrl,
                method: "POST",
                headers: {
                    'X-Parse-Application-Id': EnvUtils.get().appId,
                    'X-Parse-Master-Key': EnvUtils.get().generatedMasterKey!,
                    'Content-Type': 'application/json'
                },
                body: {}
            });

            console.log(`Response cloud Job ${jobName}: [status ${response.status}] ${response.text}`);
            console.log(response);
        } catch (ex) {
            console.error(`Error while triggering cloud Job ${jobName}:`);
            console.error(ex);
        }
    }

    static async runCloudFunction(jobName: string) {
        if (!jobName) {
            return;
        }
        try {
            const requestUrl = EnvUtils.get().serverUrl + '/functions/' + jobName;
            console.log(`Triggering cloud Function ${jobName} => "${requestUrl}"...`);

            const response = await Parse.Cloud.httpRequest({
                url: requestUrl,
                method: "POST",
                headers: {
                    'X-Parse-Application-Id': EnvUtils.get().appId,
                    'X-Parse-REST-API-Key': '${REST_API_KEY}',
                    'Content-Type': 'application/json'
                },
                body: {}
            });

            console.log(`Response cloud Function ${jobName}: [status ${response.status}] ${response.text}`);
            console.log(response);
        } catch (ex) {
            console.error(`Error while triggering cloud Function ${jobName}:`);
            console.error(ex);
        }
    }

}