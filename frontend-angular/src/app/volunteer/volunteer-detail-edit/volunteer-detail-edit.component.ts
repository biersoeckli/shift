import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';

@Component({
  selector: 'app-volunteer-detail-edit',
  templateUrl: './volunteer-detail-edit.component.html'
})
export class VolunteerDetailEditComponent extends BaseComponent<VolunteerParams>  {
  constructor(common: CommonService) {
    super(common);
  }
}