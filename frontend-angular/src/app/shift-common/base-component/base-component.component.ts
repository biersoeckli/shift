import { Component } from '@angular/core';
import { UrlUtils } from 'ngx-fluffy-cow';

@Component({
  templateUrl: './base-component.component.html',
})
export abstract class BaseComponentComponent<TParamType> {

  public params: TParamType;

  constructor() {
    this.params = UrlUtils.getUrlSearchParams<TParamType>();
  }
}
