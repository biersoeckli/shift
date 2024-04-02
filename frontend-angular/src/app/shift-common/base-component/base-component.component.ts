import { fluffyLoading, UrlUtils } from 'ngx-fluffy-cow';
import { CommonService } from '../services/common.service';
import { NavigationService } from '../services/navigation.service';
import * as Parse from 'parse';
import { AlertInputDialogData, AlertInputDialogComponent } from '../components/alert-input-dialog/alert-dialog.component';

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

  inputDialog(input: AlertInputDialogData) {
    return new Promise<string | undefined>((resolve, reject) => {
      const dialog = this.commonService.alertService.dialog.open(AlertInputDialogComponent, {
        width: '500px',
        data: input
      });

      dialog.afterClosed().subscribe(async result => {
        if (result) {
          resolve(result);
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
