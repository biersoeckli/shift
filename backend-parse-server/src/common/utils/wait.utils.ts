export async function wait(seconds: number) {
    return await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000 * seconds));
}