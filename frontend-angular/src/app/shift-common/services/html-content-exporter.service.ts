import { ElementRef, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HtmlContentExport {
    exportItems: HtmlContentExportItem[];
    fileName: string;
    outputType: 'image' | 'pdf';
    format: 'A4' | 'fit';
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

    async export(exportConfig: HtmlContentExport) {
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

        const doc = exportConfig.format === 'A4' ? this.createA4Pdf() : this.createFitPdf(htmlContentExportItems);

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

   private createFitPdf(htmlContentExportItems: HtmlContentExportCanvasItem[]) {
        const heigthOfAllCanvas = htmlContentExportItems.reduce((prev, current) => prev + current.canvas.height, 0);
        const maxWidthOfCanvas = htmlContentExportItems.reduce((prev, current) =>
            prev < current.canvas.width ? current.canvas.width : prev, 0);
        return new jsPDF({
            unit: 'px',
            format: [maxWidthOfCanvas + (2 * this.pagePadding), heigthOfAllCanvas + (2 * this.pagePadding)],
            orientation: 'landscape'
        });
    }

    private createA4Pdf() {
        return new jsPDF({
            unit: 'px',
            format: 'A4',
            orientation: 'landscape'
        });
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
            removeContainer: true
        });
    }
}
