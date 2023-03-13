import { fluffyLoading, UrlUtils } from 'ngx-fluffy-cow';
import { CommonService } from '../services/common.service';
import { NavigationService } from '../services/navigation.service';
import * as Parse from 'parse';

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

  get currentUser() {
    return Parse.User.current();
  }

  constructor(public readonly commonService: CommonService) {
    this.params = UrlUtils.getUrlSearchParams<TParamType>();
  }

  async getUserById(userId: string) {
    return await this.commonService.getUserById(userId);
  }

  @fluffyLoading()
  async loady<T>(func: () => Promise<T>): Promise<T> {
    return await func();
  }
}
