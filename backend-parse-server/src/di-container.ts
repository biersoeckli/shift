import { ContainerBuilder, Autowire } from 'node-dependency-injection'
import { AuthService } from './auth/auth.service';
import { SmsService } from './sms/sms.service';
/* eslint-disable */
export class DiContainer {

    static container: ContainerBuilder;

    static get<TServiceType>(someService: any): TServiceType {
        return this.container.get<TServiceType>(someService);
    }

    static async init() {
        const container = new ContainerBuilder();
        container.register('services.AuthService', AuthService);
        container.register('services.SmsService', SmsService);
        this.container = container;
    }
}