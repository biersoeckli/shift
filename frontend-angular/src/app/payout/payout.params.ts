export class PayoutParams {
    constructor(public readonly eventId: string, 
        public readonly payoutConfigId?: string) {}
}