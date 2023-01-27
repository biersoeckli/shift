import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { PdfCreatorService } from "../../common/services/pdf-creator.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { PayoutCalculationService } from "../../payout/payout-calculation.service";
import { VolunteerContractService } from "../../volunteer-contract/volunteer-contract.service";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";

export interface VolunteerContractResult {
    url: string;
    fileName: string;
}

@Service()
export class GenerateVolunteerContractFunction extends BaseCloudFunction<VolunteerContractResult> {

    constructor(private readonly volunteerContractService: VolunteerContractService,
        private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if ([request.params.userId, request.params.eventId].some(x => !x)) {
            throw 'not all params provided';
        }
        if (!(await this.roleService.isVolunteerOrOrganizer(request.user as Parse.User, request.params.userId, request.params.eventId))) {
            throw 'unauthorized';
        }
        const outputInfo = await this.volunteerContractService.generateAndSaveContractToPublicFolder(request.params.eventId, request.params.userId);
        return {
            url: outputInfo.url,
            fileName: outputInfo.fileName
        } as VolunteerContractResult;
    }
}