import { ElementRef, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HtmlContentExport {
    exportItems: HtmlContentExportItem[];
    outputType: 'image' | 'pdf';
    fileName: string;
}

export interface HtmlContentExportItem {
    htmlElement: ElementRef;
    widthPercent?: number;
}

interface HtmlContentExportCanvasItem extends HtmlContentExportItem {
    canvas: HTMLCanvasElement;
}

@Injectable({
    providedIn: 'root'
})
export class HtmlContentExporterService {

    private pagePadding = 20;

    async print(exportConfig: HtmlContentExport) {
        if (!exportConfig?.outputType) {
            return;
        }
        const htmlContentExportItems = await Promise.all(exportConfig.exportItems.map(async exportItems => {
            (exportItems as HtmlContentExportCanvasItem).canvas = await this.getCanvas(exportItems.htmlElement);
            return exportItems as HtmlContentExportCanvasItem;
        }));

        if (exportConfig.outputType === 'image') {
            htmlContentExportItems.forEach(item => this.downloadImage(item.canvas, exportConfig.fileName));
            return;
        }

        const doc = new jsPDF({
            unit: 'px',
            format: 'a4',
            orientation: 'landscape'
        });

        var pageWidth = doc.internal.pageSize.getWidth() - (2 * this.pagePadding);

        let totalHeigthOfUsedSpace = 0;
        htmlContentExportItems.forEach(item => {
            const newImageWidth = item.widthPercent ?
                Math.floor((pageWidth * item.widthPercent) / 100) : pageWidth;
            const newImageHeigth = Math.floor((newImageWidth * item.canvas.height) / item.canvas.width);

            doc.addImage(item.canvas.toDataURL('JPEG'),
                'JPEG',
                this.pagePadding,
                totalHeigthOfUsedSpace + this.pagePadding,
                newImageWidth,
                newImageHeigth
            );
            totalHeigthOfUsedSpace += newImageHeigth;
        });
        doc.save(exportConfig.fileName ?? 'export.pdf');
    }

    private downloadImage(canvas: HTMLCanvasElement, fileName: string) {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('JPEG');
        link.download = `${fileName}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private async getCanvas(htmlElement: ElementRef) {
        return await html2canvas(htmlElement.nativeElement, {
            removeContainer: true, 
           /* onclone: (document) => {
                if (!document) {
                    return;
                } // todo
                const sss = (document?.querySelector('.shift-entry') as any).style;
                if (!sss) {
                    return;
                }
                sss.marginLeft = 0;
              }*/
        });
    }
}
