import { Component, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { HtmlContentExporterService, HtmlContentExportItem } from 'src/app/shift-common/services/html-content-exporter.service';
import { UserPickerDialogComponent } from '../user-picker-dialog/user-picker-dialog.component';

@Component({
  selector: 'app-shift-table-print-overlay',
  templateUrl: './shift-table-print-overlay.component.html'
})
export class ShiftTablePrintOverlayComponent {

  constructor(public dialogRef: MatDialogRef<ShiftTablePrintOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) private elements: ElementRef[],
    private readonly contentExporter: HtmlContentExporterService) { }

  @fluffyLoading()
  async print(format: 'A4' | 'fit' | 'image') {
    await this.contentExporter.export({
      exportItems: this.elements.map((element, index) => {
        return {
          htmlElement: element,
          widthPercent: index > 0 ? 20 : 100
        } as HtmlContentExportItem;
      }),
      outputType: format === 'image' ? 'image' : 'pdf',
      fileName: 'schichtplan.pdf',
      format: format === 'A4' ? 'A4' : 'fit'
    });
    await this.dialogRef.close();
  }
}
