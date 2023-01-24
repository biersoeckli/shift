
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export class SanitazionUtils {
    static sanitize(inputString: string) {
        const window = new JSDOM('').window;
        const purify = DOMPurify(window as any);
        return purify.sanitize(inputString ?? '');
    }
}