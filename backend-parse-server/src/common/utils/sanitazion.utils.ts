
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export class SanitazionUtils {
    static sanitize(inputString: string) {
        const window = new JSDOM('').window;
        try {
            const purify = DOMPurify(window as any);
            return purify.sanitize(inputString ?? '');
        } finally {
            window.close();
        }
    }
}