import { Component } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';
import { AlertService } from './shift-common/services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'shift';
  constructor(alertService: AlertService) {
    Parse.initialize(environment.parseAppId);
    (Parse as any).serverURL = environment.parseServerUrl;
    alertService.initFluffyCatch();
  }
}
