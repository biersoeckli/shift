import { Component } from '@angular/core';
import { fluffyCatch, fluffyLoading, fluffyLoady } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { DownloadUtils } from 'src/app/shift-common/utils/download.utils';
import { VolunteerParams } from '../volunteer.params';

export interface VolunteerContractResult {
  url: string;
  fileName: string;
}

@Component({
  selector: 'app-volunteer-detail',
  templateUrl: './volunteer-detail.component.html'
})
export class VolunteerDetailComponent extends BaseComponent<VolunteerParams>  {

  userEvent?: Parse.Object<Parse.Attributes>;
  userEventCategories?: Parse.Object<Parse.Attributes>[];
  userShiftWishes?: Parse.Object<Parse.Attributes>[];
  userShifts?: Parse.Object<Parse.Attributes>[];

  get user() {
    return this.userEvent?.get('user')
  }

  get event() {
    return this.userEvent?.get('event')
  }

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  @fluffyCatch()
  async init() {
    if (!this.params.userEventId) {
      return;
    }
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.include('user');
    query.include('event');
    this.userEvent = await query.get(this.params.userEventId);
    [this.userEventCategories, this.userShiftWishes, this.userShifts] = await Promise.all([
      this.fetchUserCategories(this.event, this.user),
      this.getWishBookingsForEventAndUser(this.event, this.user),
      this.getUserShiftForEvent(this.event, this.user),
    ]);
  }

  async getWishBookingsForEventAndUser(event: Parse.Object<Parse.Attributes>, user: Parse.User<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserShiftWish'));
    query.equalTo('event', event);
    query.equalTo('user', user);
    query.include('event');
    query.include('user');
    query.include('shift');
    return await query.find();
  }


  async fetchUserCategories(event: Parse.Object<Parse.Attributes>, user: Parse.User<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserEventCategory'));
    query.include('category');
    query.equalTo('event', event);
    query.equalTo('user', user);
    return await query.find();
  }

  async getUserShiftForEvent(event: Parse.Object<Parse.Attributes>, user: Parse.User<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserShift'));
    query.equalTo('event', event);
    query.equalTo('user', user);
    query.ascending('start');
    return await query.find();
  }

  @fluffyLoading()
  @fluffyCatch()
  async downloadVolunteerContract() {
    const returnVal: VolunteerContractResult = await Parse.Cloud.run('generateVolunteerContract', { userId: this.user?.id, eventId: this.event?.id });
    window.open(returnVal.url, '_blank');
  }

  @fluffyCatch()
  async generateVolunteerReceipt() {
    let userPayoutInfo: {
      payoutTotal: number; shifts: any[];
    } | undefined;

    await fluffyLoady(async () => {
      userPayoutInfo = (await Parse.Cloud.run('calculateUserPayoutInfoForEvent',
        { userId: this.user?.id, eventId: this.params.eventId })) ?? [];
    });

    const customPayoutAmount = await this.inputDialog({
      title: 'Auszahlungsbetrag überschreiben',
      text: 'Gib den endgültigen Auszahlungsbetrag ein',
      placeholder: 'z.B. 100',
      value: userPayoutInfo!.payoutTotal + '',
    });
    if (!customPayoutAmount) {
      return;
    }

    await fluffyLoady(async () => {
      const returnVal: VolunteerContractResult = await Parse.Cloud.run('generateVolunteerReceipt', {
        userId: this.user?.id,
        eventId: this.params.eventId,
        overridePayoutAmount: +customPayoutAmount ?? undefined
      });
      window.open(returnVal.url, '_blank');
    });
  }

  @fluffyLoading()
  @fluffyCatch()
  async save() {
    await this.userEvent?.save();
  }

  @fluffyLoading()
  @fluffyCatch()
  async deleteVolunteer() {
    if (!confirm('Willst du den/die Helfer/in wirklich vom Event entfernen?')) {
      return;
    }
    await this.userEvent?.destroy();
    await this.navigation.eventVolunteerOverview(this.params.eventId);
  }
}
