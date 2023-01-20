import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserEventDetailParams } from '../user-event-detail/user-event-detail.params';

@Component({
  selector: 'app-user-shift-overview',
  templateUrl: './user-shift-overview.component.html'
})
export class UserShiftOverviewComponent extends BaseComponent<UserEventDetailParams> {

  constructor(common: CommonService) {
    super(common);
  }
}
