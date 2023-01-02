import simpleGit, { SimpleGitOptions, SimpleGit } from "simple-git";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";

@Service()
export class ApplicationUpdateJob {

    private git: SimpleGit;

    constructor() {
        const options: Partial<SimpleGitOptions> = {
            baseDir: process.cwd(),
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false,
        };

        // when setting all options in a single object
        this.git = simpleGit(options);
    }
    async run() {
        if (!EnvUtils.get().production) {
            console.log('[ApplicationUpdateJob] skipping application update, because application is not in production mode.');
        }
        console.log(`[ApplicationUpdateJob] Checking for available updates...`);
        await this.git.fetch();
        const gitStatus = await this.git.status();
        console.log(`[ApplicationUpdateJob] local application is ${gitStatus.behind} behind.`);
        if (gitStatus.behind > 0) {
            // update the software
            console.log(`[ApplicationUpdateJob] Running update...`);
            await this.git.pull();
            console.log(`[ApplicationUpdateJob] Fetched latest sources, restarting application.`);
            process.exit();
        }
    }
}