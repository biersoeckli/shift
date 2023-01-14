import { UrlUtils } from 'ngx-fluffy-cow';
import { CommonService } from '../services/common.service';
import { NavigationService } from '../services/navigation.service';

export abstract class BaseComponent<TParamType> {

  public params: TParamType;

  get navigation(): NavigationService {
    return this.commonService.navigationService;
  }

  get router() {
    return this.commonService.navigationService.router;
  }

  get eventService() {
    return this.commonService.eventService;
  }

  constructor(public readonly commonService: CommonService) {
    this.params = UrlUtils.getUrlSearchParams<TParamType>();
  }
}
