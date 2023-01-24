import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { VolunteerParams } from '../volunteer.params';
import * as Parse from 'parse';
import * as DOMPurify from 'dompurify';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-volunteer-contract-config-edit',
  templateUrl: './volunteer-contract-config-edit.component.html'
})
export class VolunteerContractConfigEditComponent extends BaseComponent<VolunteerParams>  {

  htmlPreview?: string;
  event?: Parse.Object<Parse.Attributes>;
  contractConfig?: Parse.Object<Parse.Attributes>;


  constructor(common: CommonService,
    private sanitizer: DomSanitizer) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    this.event = await this.eventService.getEventById(this.params.eventId, false, true);
    if (!this.event.get('volunteerContractConfig')) {
      const volunteerContractConfig = new (Parse.Object.extend('VolunteerContractConfig'));
      volunteerContractConfig.set('content', '');
      volunteerContractConfig.set('event', this.event);
      this.contractConfig = await volunteerContractConfig.save();
      this.event.set('volunteerContractConfig', this.contractConfig);
      this.event = await this.event.save();
    } else {
      const query = new Parse.Query(Parse.Object.extend('VolunteerContractConfig'));
      this.contractConfig = await query.get(this.event.get('volunteerContractConfig').id);
      this.contractConfig.set('event', this.event);
    }
    this.renderPreview();
  }

  renderPreview() {
    const content = this.contractConfig?.get('content') as string ?? '';
    const generatedHtmlFromMarkdown = marked.parse(content);
    this.htmlPreview = generatedHtmlFromMarkdown;
  }

  @fluffyLoading()
  async save() {
    if (!this.contractConfig) {
      return;
    }
    await this.contractConfig.save();
    await this.navigation.eventDetailEdit(this.params.eventId);
  }
}
