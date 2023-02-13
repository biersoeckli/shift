import { Injectable } from "@angular/core";
import { DownloadUtils } from "../utils/download.utils";

@Injectable()
export class CsvExporterService {

    objectsToCsvAndDownload<T extends Object>(inputObject: T[], fileName: string, addHeader = true) {
        const dataUrl = this.objectsToCsv(inputObject, addHeader);
        DownloadUtils.downloadFromUrl(dataUrl, fileName);
    }

    objectsToCsv<T extends Object>(inputObject: T[], addHeader = true) {
        const allKeys = [...new Set(inputObject.flatMap(obj => Object.keys(obj)))]
            .filter(x => !['ACL', 'sessionToken', 'username'].includes(x));
        const header = allKeys.join(';');
        const rows = inputObject.map(obj => allKeys.map(key => (obj as any)[key]).join(';'));
        const fileData = (addHeader ? [header, ...rows] : rows).join('\n');
        return this.createPlainTextUrl(fileData);
    }

    private createPlainTextUrl(data: string) {
        return 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
    }
}