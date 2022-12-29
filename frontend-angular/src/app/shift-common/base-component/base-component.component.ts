import { Component } from '@angular/core';
import { UrlUtils } from 'ngx-fluffy-cow';
import { CommonService } from '../services/common.service';
import { NavigationService } from '../services/navigation.service';

@Component({
  templateUrl: './base-component.component.html',
})
export abstract class BaseComponentComponent<TParamType> {

  public params: TParamType;

  get navigation(): NavigationService {
    return this.commonService.navigationService;
  }

  get router() {
    return this.commonService.navigationService.router;
  }

  constructor(public readonly commonService: CommonService) {
    this.params = UrlUtils.getUrlSearchParams<TParamType>();
  }
}
