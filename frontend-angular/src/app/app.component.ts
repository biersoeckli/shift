import { Component } from '@angular/core';
import * as Parse from 'parse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'shift';
  constructor() {
    Parse.initialize('appid');
    (Parse as any).serverURL = 'http://localhost:1337/parse';
  }
}
