import fs from "fs"
import fsPromises from "fs/promises"

export class FsUtils {
    static createDirIfNotExists(pathName: string, recursive = false) {
        if (!fs.existsSync(pathName)) {
            fs.mkdirSync(pathName, {
                recursive
            });
        }
    }
    static async createDirIfNotExistsAsync(pathName: string, recursive = false) {
        if (!fs.existsSync(pathName)) {
            await fsPromises.mkdir(pathName, {
                recursive
            });
        }
    }
}