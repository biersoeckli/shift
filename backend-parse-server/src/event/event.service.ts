import { Service } from "typedi";

@Service()
export class EventService {

    async getEventById(eventId: string, includeVolunteerContractConfig = false) {
        const query = new Parse.Query(Parse.Object.extend('Event'));
        if (includeVolunteerContractConfig) {
            query.include('volunteerContractConfig');
        }
        return await query.get(eventId, { useMasterKey: true });
    }
}