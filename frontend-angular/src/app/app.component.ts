import { Component } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'shift';
  constructor() {
    Parse.initialize(environment.parseAppId);
    (Parse as any).serverURL = environment.parseServerUrl;
  }
}
