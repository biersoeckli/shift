import * as Parse from 'parse';

export class ParseObjectUtils {
    static duplicate(object: Parse.Object): Parse.Object {
        // Create a new Parse.Object with the same class name as the original object
        const newObj = new Parse.Object(object.className);
        
        // Copy over all properties from the original object to the new object
        const keys = Object.keys(object.toJSON()).filter(x => !['createdAt', 'ACL', 'updatedAt', 'id', 'objectId'].includes(x));
        for (const key of keys) {
          newObj.set(key, object.get(key));
        }        
        return newObj;
      }
}