export class ListUtils {
    static sortListByPropertyAsc<TObjectType>(list: TObjectType[], property: keyof TObjectType): TObjectType[] {
        return list.sort((a: TObjectType, b: TObjectType) => {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }
            return 0;
        });
    }
}