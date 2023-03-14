import { Component } from '@angular/core';
import { fluffyLoading, fluffyCatch } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';
import * as Parse from 'parse';
import { MatDialog } from '@angular/material/dialog';
import { VolunteerMultipleChooserOverlayComponent } from '../volunteer-multiple-chooser-overlay/volunteer-multiple-chooser-overlay.component';

@Component({
  selector: 'app-volunteer-contract-mail-sender',
  templateUrl: './volunteer-contract-mail-sender.component.html'
})
export class VolunteerContractMailSenderComponent extends BaseComponent<VolunteerParams>  {

  event?: Parse.Object<Parse.Attributes>;
  contractConfig?: Parse.Object<Parse.Attributes>;
  selectedUsers?: Parse.Object<Parse.Attributes>[];

  constructor(common: CommonService,
    private readonly dialog: MatDialog) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  @fluffyCatch()
  async init() {
    this.event = await this.eventService.getEventById(this.params.eventId, false, true);
    if (!this.event.get('volunteerContractConfig')) {
      const volunteerContractConfig = new (Parse.Object.extend('VolunteerContractConfig'));
      volunteerContractConfig.set('content', '');
      volunteerContractConfig.set('event', this.event);
      this.contractConfig = await volunteerContractConfig.save();
      this.event.set('volunteerContractConfig', this.contractConfig);
      this.event = await this.event.save();
    } else {
      const query = new Parse.Query(Parse.Object.extend('VolunteerContractConfig'));
      this.contractConfig = await query.get(this.event.get('volunteerContractConfig').id);
      this.contractConfig.set('event', this.event);
    }
  }

  @fluffyCatch()
  @fluffyLoading()
  async saveContractConfig() {
    await this.contractConfig?.save()
  }

  @fluffyCatch()
  async chooseVolunteers() {
    const pickedUsers = await this.pickUsers();
    if (!pickedUsers || pickedUsers.length === 0) {
      return;
    }
    this.selectedUsers = pickedUsers.map(userEvent => userEvent.get('user'));
  }

  @fluffyCatch()
  async sendContractToVolunteers() {
    if (!this.selectedUsers || !(await this.commonService.alertService.show({
      title: 'Helfervertrag versenden',
      text: `Willst du den Helfervertrag an folgende HelferInnen versenden: ${this.selectedUsers.map(user => `${user.get('firstName')} ${user.get('lastName')}`).join(', ')}`,
      okButton: 'Ja',
      cancelButton: 'Nein'
    }))) {
      return;
    }
    await this.loady(async () => {
      await Parse.Cloud.run('sendVolunteerContractsByMail', { eventId: this.params.eventId, userIds: this.selectedUsers?.map(user => user.id) });
      await this.navigation.eventDetail(this.params.eventId);
    });
  }

  pickUsers(): Promise<Parse.Object[]> {
    return new Promise((resolve) => {
      const dialog = this.dialog.open(VolunteerMultipleChooserOverlayComponent, {
        maxWidth: '500px',
        data: this.params.eventId
      });
      dialog.afterClosed().subscribe(result => {
        resolve(result ?? []);
      })
    })
  }
}
