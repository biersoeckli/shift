import { Component, OnInit } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';
import * as Parse from 'parse';
import { MatDialog } from '@angular/material/dialog';
import { VolunteerExportOverlayComponent } from '../volunteer-export-overlay/volunteer-export-overlay.component';
import { VolunteerMultipleChooserOverlayComponent } from '../volunteer-multiple-chooser-overlay/volunteer-multiple-chooser-overlay.component';
import { VolunteerMailResult } from '../models/volunteer-mail-result.model';

@Component({
  selector: 'app-volunteer-overview',
  templateUrl: './volunteer-overview.component.html'
})
export class VolunteerOverviewComponent extends BaseComponent<VolunteerParams>  {

  constructor(common: CommonService,
    private readonly dialog: MatDialog) {
    super(common);
  }

  @fluffyCatch()
  @fluffyLoading()
  downloadVolunteerList() {
    this.dialog.open(VolunteerExportOverlayComponent, {
      width: '400px',
      data: this.params.eventId
    });
  }

  @fluffyCatch()
  async sendMailToVolunteers() {
    const pickedUsers = await this.pickUsers();
    if (pickedUsers?.length === 0) {
      return;
    }
    await this.loady(async () => {
      const allUserMails = await Parse.Cloud.run('getMailAdressesForAllVolunteers', { eventId: this.params.eventId }) as VolunteerMailResult[];
      const mailList = pickedUsers.map(userEvent => {
        const userMail = allUserMails.find(userMail => userMail.userId === userEvent.get('user').id)?.email;
        return userMail ?? 'NO_MAIL_USER_ID_' + userEvent.get('user').id
      });
      window.open("mailto:" + mailList.join(';'));
    })
  }

  @fluffyCatch()
  async deleteVolunteers() {
    const pickedUsers = await this.pickUsers();
    if (pickedUsers?.length === 0) {
      return;
    }
    const alertResult = await this.commonService.alertService.show({
      title: 'HelferInnen löschen',
      text: `Willst du wirklick ${pickedUsers.length} HelferInnen löschen?`,
      okButton: 'Ja',
      cancelButton: 'Nein'
    });
    if (alertResult) {
      await Parse.Object.destroyAll(pickedUsers);
      location.reload();
    }
  }

  pickUsers(): Promise<Parse.Object[]> {
    return new Promise((resolve) => {
      const dialog = this.dialog.open(VolunteerMultipleChooserOverlayComponent, {
        width: '400px',
        data: this.params.eventId
      });
      dialog.afterClosed().subscribe(result => {
        resolve(result ?? []);
      })
    })
  }
}
