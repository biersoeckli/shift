
export function isEmpty<T>(input?: T[]) {
    return !input || input.length === 0;
}

export function isNotEmpty<T>(input?: T[]) {
    return !isEmpty(input);
}