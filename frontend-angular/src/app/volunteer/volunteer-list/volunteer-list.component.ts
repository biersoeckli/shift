import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { CsvExporterService } from 'src/app/shift-common/services/csv-exporter.service';
import { EventService } from 'src/app/shift-common/services/event.service';

@Component({
  selector: 'shift-volunteer-list',
  templateUrl: './volunteer-list.component.html'
})
export class VolunteerListComponent implements OnInit {

  @Input() showDownloadButton = false;
  @Input() eventId?: string;
  @Output() userEventSelected = new EventEmitter<Parse.Object<Parse.Attributes>>();
  userEvents?: Parse.Object<Parse.Attributes>[];
  filteredUserEvents?: Parse.Object<Parse.Attributes>[];
  searchTerm = '';

  constructor(private readonly eventService: EventService,
    private readonly csvExporter: CsvExporterService) {
  }

  @fluffyCatch()
  async ngOnInit() {
    const event = await this.eventService.getEventById(this.eventId ?? '');
    await this.getUserEvents(event);
    this.filter();
  }

  private async getUserEvents(event: Parse.Object<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.equalTo('event', event);
    query.include('user');
    query.limit(10000);
    this.userEvents = await query.find();
  }

  filter() {
    if (!this.searchTerm) {
      this.filteredUserEvents = this.userEvents;
    }
    this.filteredUserEvents = this.userEvents?.filter(userEvent =>
      `${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')}`.toLocaleLowerCase()
        .includes(this.searchTerm.toLocaleLowerCase())) ?? [];
  }

  selectUser(userEvent: Parse.Object<Parse.Attributes>) {
    this.userEventSelected.next(userEvent);
  }

  @fluffyCatch()
  @fluffyLoading()
  async downloadVolunteerList() {
    if (!this.userEvents) {
      return;
    }

    var userCategories = await this.eventService.fetchAllUserEventCategory(this.eventId ?? '');
    const exportData = this.userEvents.map(userEvent => {
      const object = {
        ...userEvent.get('user').attributes,
        Anzahl_Wunschschichten_Kategorien: userCategories.length
      };
      userCategories.filter(category => category.get('user').id === userEvent.get('user').id)
        .forEach(userCat => object['Wunsch_' + userCat.get('category').get('name')] = 'x');
      return object;
    });

    this.csvExporter.objectsToCsvAndDownload(exportData, 'helferliste.csv');
  }
}
