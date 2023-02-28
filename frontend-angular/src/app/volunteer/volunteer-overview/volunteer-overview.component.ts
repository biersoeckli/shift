import { Component, OnInit } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';
import * as Parse from 'parse';
import { MatDialog } from '@angular/material/dialog';
import { VolunteerExportOverlayComponent } from '../volunteer-export-overlay/volunteer-export-overlay.component';

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
}
