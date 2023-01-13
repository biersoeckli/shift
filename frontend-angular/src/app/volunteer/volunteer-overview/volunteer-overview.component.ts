import { Component, OnInit } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-volunteer-overview',
  templateUrl: './volunteer-overview.component.html'
})
export class VolunteerOverviewComponent extends BaseComponent<VolunteerParams>  {

  constructor(common: CommonService) {
    super(common);
  }
}
