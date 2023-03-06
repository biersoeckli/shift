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

    async getUserEvents(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('UserEvent'));
        query.equalTo('event', await this.getEventById(eventId));
        query.include('user');
        query.limit(10000);
        return await query.find({ useMasterKey: true });
    }

    async getUserShifts(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('UserShift'));
        query.equalTo('event', await this.getEventById(eventId));
        query.include('user');
        query.limit(10000);
        return await query.find({ useMasterKey: true });
    }
}