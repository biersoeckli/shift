export class StringUtils {
    public static isEmpty(value: string) {
        return !value || value.split(' ').join('').length === 0;
    }

    public static isNotEmpty(value: string) {
        return !this.isEmpty(value);
    }
}
