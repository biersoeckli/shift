import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fluffyCatchBS } from 'ngx-fluffy-cow';
import { GlobalAlertComponent, GlobalDialogParams } from 'src/app/global-alert/global-alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertIsVisible = false;

  constructor(private readonly dialog: MatDialog) { }

  async initFluffyCatch() {
    fluffyCatchBS.subscribe(error => {
      if (!error) {
        return;
      }
      this.show({
        title: 'Ein Fehler ist aufgetreten.',
        text: error.message ? `Fehlermeldung: ${error.message}` : 'Ein unbekannter Fehler ist aufgetreten.'
      });
    })
  }

  async show(params: GlobalDialogParams) {
    if (this.alertIsVisible) {
      return;
    }
    this.alertIsVisible = true;
    try {
      return await new Promise(resolve => {
        const dialog = this.dialog.open(GlobalAlertComponent, {
          minWidth: '400px',
          width: '50%',
          data: params
        });
        dialog.afterClosed().subscribe(() => {
          resolve(undefined);
        });
      });
    } finally {
      this.alertIsVisible = false;
    }
  }
}
