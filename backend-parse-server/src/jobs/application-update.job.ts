import simpleGit, { SimpleGitOptions, SimpleGit } from "simple-git";
import { Service } from "typedi";

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
       const gitStatus = await this.git.status();
       console.log(gitStatus);
    }
}