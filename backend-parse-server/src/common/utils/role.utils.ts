import { Service } from "typedi";
import { getEventAdminRole, getEventViewerRole } from "../constants/roles.constants";

@Service()
export class RoleService {

    async isUserOrganizerOfEvent(user?: Parse.User<Parse.Attributes>, eventId?: string) {
        if (!eventId || !user) {
            return false;
        }
        return await RoleService.isUserInRole(user, getEventAdminRole(eventId));
    }

    async isUserVolunteerOfEvent(user?: Parse.User<Parse.Attributes>, eventId?: string) {
        if (!eventId || !user) {
            return false;
        }
        return await RoleService.isUserInRole(user, getEventViewerRole(eventId));
    }

    async isVolunteerOrOrganizer(requestUser: Parse.User<Parse.Attributes>, userId: string, eventId: string) {
        const isVolunteer = requestUser.id === userId &&
            await this.isUserVolunteerOfEvent(requestUser, eventId);
        const isOrganizer = await this.isUserOrganizerOfEvent(requestUser, eventId);
        return isVolunteer || isOrganizer;
    }

    static async getOrCreateRole(roleName: string) {
        const query = new Parse.Query('_Role');
        query.equalTo('name', roleName);
        let role = await query.first();
        if (!role) {
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(false);

            role = new Parse.Object('_Role');
            role.set('name', roleName);
            role.setACL(acl);
            role = await role.save(null, { useMasterKey: true });
        }
        return role;
    }

    static async addUserId2Role(roleName: string, userId: string) {
        const User = Parse.Object.extend('_User');
        const userQuery = new Parse.Query(User);
        const userObject = await userQuery.get(userId, { useMasterKey: true });
        await this.addUser2Role(roleName, userObject);
    }

    static async addUser2Role(roleName: string, userObject: Parse.Object<Parse.Attributes>) {
        if (!userObject) {
            throw `could not add user to role ${roleName}. User not provided.`;
        }
        const query = new Parse.Query('_Role');
        query.equalTo('name', roleName);
        const userRole = await query.first({ useMasterKey: true });
        if (!userRole) {
            throw `could not add user id ${userObject?.id} to role ${roleName}. Role with name ${roleName} not found.`;
        }
        const relation = userRole.relation('users');
        relation.add(userObject);
        await userRole.save(null, { useMasterKey: true });
    }

    static async removeUserIdFromRole(roleName: string, userId: string) {

        const User = Parse.Object.extend('_User');
        const userQuery = new Parse.Query(User);
        const userObject = await userQuery.get(userId, { useMasterKey: true });

        const query = new Parse.Query('_Role');
        query.equalTo('name', roleName);
        const userRole = await query.first({ useMasterKey: true });
        if (!userRole) {
            return;
        }
        const relation = userRole.relation('users');
        relation.remove(userObject);
        await userRole.save(null, { useMasterKey: true });
    }

    static async isUserInRole(user: Parse.Object<Parse.Attributes>, roleName: string) {
        if (!user || !roleName) {
            return false;
        }
        return this.isUserIdInRole(user.id, roleName);
    }

    static async isUserIdInRole(userId: string, roleName: string) {
        if (!userId || !roleName) {
            return false;
        }
        const User = Parse.Object.extend('_User');
        const Role = Parse.Object.extend('_Role');

        const innerQuery = new Parse.Query(User);
        innerQuery.equalTo('objectId', userId);

        const query = new Parse.Query(Role);
        query.equalTo('name', roleName);
        query.matchesQuery('users', innerQuery);

        const comments = await query.find({ useMasterKey: true });
        return comments ? comments.length > 0 : false;
    }
}