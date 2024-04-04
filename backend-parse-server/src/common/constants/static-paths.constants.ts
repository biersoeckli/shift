import { EnvUtils } from "../utils/env.utils";
import path from "path";

export class StaticPathConstants {
    static getPublicDataFilePath() {
        return path.join(EnvUtils.appRoot, 'public-data');
    }

    static getReceiptTemplateFilePath() {
        return path.join(EnvUtils.appRoot, 'templates', 'receipt.html');
    }

    static getFrontendPath() {
        return path.join(EnvUtils.appRoot, 'frontend');
    }

    static getVolunteerContractFilePath() {
        return path.join(this.getPublicDataFilePath(), 'volunteer-contracts');
    }

    static publicDataUrlPath = '/public';
    static volunteerContractUrlPath = this.publicDataUrlPath + '/volunteer-contracts';
}