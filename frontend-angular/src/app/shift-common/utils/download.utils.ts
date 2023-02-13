export class DownloadUtils {

    static downloadFromUrl(url: string, filename: string) {
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = url;
        link.download = filename;
        link.click();
        document.body.removeChild(link);
    }

    static downloadUint8ArrayPdf(data: Uint8Array, filename: string) {
        const blob = new Blob([data], { type: 'application/pdf' });
        const objectURL = URL.createObjectURL(blob);
        this.downloadFromUrl(objectURL, filename);
    }
}
