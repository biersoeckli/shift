export interface EventConfig {
    volunteerRegistrationEnabled: string;
    showShiftPlanToVolunteers: string;
    volunteerPayoutEnabled: string;
    volunteerContractEnabled: string;
    documentUploadEnabled: string;
}

export class EventConfigUtils {
    static getFromEvent(event: Parse.Object<Parse.Attributes>) {
        return {
            volunteerRegistrationEnabled: event?.get('volunteerRegistrationEnabled') ?? false,
            showShiftPlanToVolunteers: event?.get('showShiftPlanToVolunteers') ?? false,
            volunteerPayoutEnabled: event?.get('volunteerPayoutEnabled') ?? false,
            volunteerContractEnabled: event?.get('volunteerContractEnabled') ?? false,
            documentUploadEnabled: event?.get('documentUploadEnabled') ?? false
        } as EventConfig;
    }
}
