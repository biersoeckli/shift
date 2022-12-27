import * as Parse from 'parse';

/**
 * A util class for Parse Users => https://parseplatform.org
 */
export class ParseUserUtils {

  static async isLoggedInUserInRole(roleName: string) {
    if (!roleName || !Parse.User.current()) {
        return false;
    }
    return await this.isUserInRole((await Parse.User.current()?.fetch()), roleName);
  }

  static async isUserInRole(user: any, roleName: string) {
    if (!user || !roleName) {
        return false;
    }
    const User = Parse.Object.extend('_User');
    const Role = Parse.Object.extend('_Role');

    const innerQuery = new Parse.Query(User);
    innerQuery.equalTo('objectId', user.id);

    const query = new Parse.Query(Role);
    query.equalTo('name', roleName);
    query.matchesQuery('users', innerQuery);

    const results = await query.find();
    
    return results ? results.length > 0 : false;
  }
}