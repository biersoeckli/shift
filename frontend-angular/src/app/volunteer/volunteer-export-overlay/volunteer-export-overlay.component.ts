import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { EventDocumentUploadOverlayComponent, EventDocumentUploadOverlayInput } from 'src/app/documents/event-document-upload-overlay/event-document-upload-overlay.component';
import { CsvExporterService } from 'src/app/shift-common/services/csv-exporter.service';
import { EventService } from 'src/app/shift-common/services/event.service';
import * as Parse from 'parse';
import { UserPayoutInfo } from 'src/app/payout/services/payout.service';

interface ExportConfig {
  addVolunteerCategoryWish: boolean;
  addPayoutInformation: boolean;
}
@Component({
  selector: 'app-volunteer-export-overlay',
  templateUrl: './volunteer-export-overlay.component.html'
})
export class VolunteerExportOverlayComponent {

  userEvents?: Parse.Object<Parse.Attributes>[];
  config: ExportConfig = {
    addVolunteerCategoryWish: false,
    addPayoutInformation: false
  };

  constructor(public dialogRef: MatDialogRef<EventDocumentUploadOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public eventId: string,
    private readonly eventService: EventService,
    private readonly csvExporter: CsvExporterService) {
    this.init();
  }

  async init() {
    this.userEvents = await this.eventService.getUserEvents(this.eventId);
  }

  @fluffyLoading()
  @fluffyCatch()
  async export() {
    if (!this.userEvents) {
      return;
    }

    const exportData = await Parse.Cloud.run('getUsersForEvent', { eventId: this.eventId });
    if (this.config.addVolunteerCategoryWish) {
      await this.addCategoryWish(exportData);
    }

    if (this.config.addPayoutInformation) {
      await this.addTotalPayoutToUser(exportData);
    }
    exportData.forEach((exportItem: any) => {
      if (exportItem.iban) {
        exportItem.iban = exportItem.iban.replaceAll(' ', '');
      }
    });

    this.csvExporter.objectsToCsvAndDownload(exportData, 'helferliste.csv');
    this.dialogRef.close();
  }

  async addCategoryWish(exportedData: any[]) {
    var userCategories = await this.eventService.fetchAllUserEventCategory(this.eventId);
    exportedData.forEach(exportItem => {
      const categoriesOfCurrentUser = userCategories.filter(category => category.get('user').id === exportItem.userId);
      exportItem.Anzahl_Wunschschichten_Kategorien = categoriesOfCurrentUser.length;
      categoriesOfCurrentUser.forEach(userCat => exportItem[userCat.get('category').get('name') + '_Wunschkategorie'] = 'x');
    });
  }

  async addTotalPayoutToUser(exportedData: any[]) {
    await Promise.all(exportedData.map(async exportItem => {
      const userPayoutInfo: UserPayoutInfo = await Parse.Cloud.run('calculateUserPayoutInfoForEvent',
        { userId: exportItem.userId, eventId: this.eventId });
      exportItem.Auszahlung_Total = userPayoutInfo?.payoutTotal ?? 'Keine_Auszahlungsdaten';
    }));
  }
}
