import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';

@Component({
  selector: 'app-volunteer-contract-menu',
  templateUrl: './volunteer-contract-menu.component.html'
})
export class VolunteerContractMenuComponent extends BaseComponent<VolunteerParams>  {

  constructor(common: CommonService) {
    super(common);
  }
}
