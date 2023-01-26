import { Component } from '@angular/core';
import { fluffyLoading, DateUtils, fluffyCatch } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftService, ShiftWithWishBooking } from 'src/app/shifts/services/shift.service';
import { RegistrationParams } from '../registration.params';
import * as Parse from 'parse';

interface UserEventCategorySelection {
  category: Parse.Object<Parse.Attributes>;
  userEventCategory?: Parse.Object<Parse.Attributes>;
}

@Component({
  selector: 'app-category-chooser',
  templateUrl: './category-chooser.component.html'
})
export class CategoryChooserComponent extends BaseComponent<RegistrationParams> {

  event?: Parse.Object<Parse.Attributes>;
  selectionUserCategories?: UserEventCategorySelection[];
  selectionCount = 0;
  deleteList: Parse.Object<Parse.Attributes>[] = [];

  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  @fluffyCatch()
  async init() {
    this.event = await this.shiftService.getEvent(this.params.eventId);
    const categories = await this.fetchAllCategories();
    const userEventCategories = await this.fetchUserCategories();

     this.selectionUserCategories = categories.map(category =>{
      return {
        category,
        userEventCategory: userEventCategories.find(userEventCat => userEventCat.get('category').id === category.id)
      } as UserEventCategorySelection;
     });
     if (this.selectionUserCategories.every(x => !x.userEventCategory)) {
      this.selectionUserCategories.forEach(selectCat => {
        selectCat.userEventCategory = this.create(selectCat.category);
      });
     }
     this.selectionCount = (this.selectionUserCategories?.filter(item => item.userEventCategory) ?? []).length;
  }

  async fetchAllCategories() {
    const query = new Parse.Query(Parse.Object.extend('EventCategory'));
    query.equalTo('event', this.event);
    query.ascending('name');
    return await query.find();
  }

  async fetchUserCategories() {
    const query = new Parse.Query(Parse.Object.extend('UserEventCategory'));
    query.equalTo('event', this.event);
    query.equalTo('user', Parse.User.current());
    return await query.find();
  }

  async onCategoryClick(catSelection: UserEventCategorySelection) {
    if (catSelection.userEventCategory) {
      if (catSelection.userEventCategory.id) {
        this.deleteList.push(catSelection.userEventCategory);
      }
      catSelection.userEventCategory = undefined;
    } else {
      catSelection.userEventCategory = this.create(catSelection.category);
    }
    this.selectionCount = (this.selectionUserCategories?.filter(item => item.userEventCategory) ?? []).length;
  }

  create(category: Parse.Object<Parse.Attributes>) {
    const object = new (Parse.Object.extend("UserEventCategory"));
    object.set('event', this.event);
    object.set('user', Parse.User.current());
    object.set('category', category);
    return object;
  }

  @fluffyLoading()
  @fluffyCatch()
  async save() {
    if (!this.selectionUserCategories) {
      return;
    }
    const data2Save = this.selectionUserCategories.filter(catSelection => catSelection.userEventCategory)
      .map(catSelection => catSelection.userEventCategory) as Parse.Object<Parse.Attributes>[];
    if (data2Save.length === 0) {
      return;
    }

    await Parse.Object.destroyAll(this.deleteList ?? []);
    await Parse.Object.saveAll(data2Save);
    if (this.params.returnUrl) {
      await this.router.navigateByUrl(this.params.returnUrl);
      return;
    }
    await this.navigation.registrationShiftChooser(this.params.eventId);
  }
}
