import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { fluffyLoaderBS } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-global-loader',
  templateUrl: './global-loader.component.html',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 }))
      ])
    ]
    )
  ],
  styleUrls: ['./global-loader.component.scss']
})
export class GlobalLoaderComponent implements OnInit {

  showLoader = false;

  ngOnInit(): void {
    fluffyLoaderBS.subscribe(active => this.showLoader = active);
  }
}
