import { fluffyLoading, UrlUtils } from 'ngx-fluffy-cow';
import { BaseComponent } from '../base-component/base-component.component';
import { CommonService } from '../services/common.service';
import * as Parse from 'parse';
import { DEFAULT_ERROR_MESSAGE } from '../contants';

export abstract class BaseEditComponent<TParamType> extends BaseComponent<TParamType> {

  item?: Parse.Object<Parse.Attributes>;
  errorString?: string;

  beforeSaveAction?: (unsavedItem: Parse.Object<Parse.Attributes>) => Promise<Parse.Object<Parse.Attributes>> | Parse.Object<Parse.Attributes>;
  afterSaveAction?: (savedItem: Parse.Object<Parse.Attributes>) => Promise<void> | void;

  constructor(common: CommonService,
    private className: string,
    private idParamName: keyof TParamType,
    private canCreateNewItems = true) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    this.errorString = undefined;
    try {
      if (this.params[this.idParamName]) {
        const query = new Parse.Query(Parse.Object.extend(this.className));
        this.item = await query.get(this.params[this.idParamName] + '');
      } else {
        if (!this.canCreateNewItems) {
          throw 'cannot create new object for ' + this.className;
        }
        this.item = new (Parse.Object.extend(this.className));
      }
    } catch (ex) {
      console.error(ex);
      if (ex instanceof Parse.Error) {
        this.errorString = ex.message;
      }
      if (ex instanceof Error) {
        this.errorString = DEFAULT_ERROR_MESSAGE;
      }
    }
  }

  @fluffyLoading()
  async save() {
    this.errorString = undefined;
    try {
      if (!this.item) {
        throw new Error('Cannot save an undefined object.');
      }
      if (this.beforeSaveAction) {
        this.item = await this.beforeSaveAction(this.item);
      }
      if (!this.item) {
        throw new Error('Cannot save an undefined object.');
      }
      const savedItem = await this.item.save();
      if (this.afterSaveAction) {
        await this.afterSaveAction(savedItem);
      }
    } catch (ex) {
      console.error(ex);
      if (ex instanceof Parse.Error) {
        this.errorString = ex.message;
      }
      if (ex instanceof Error) {
        this.errorString = DEFAULT_ERROR_MESSAGE;
      }
    }
  }

}
