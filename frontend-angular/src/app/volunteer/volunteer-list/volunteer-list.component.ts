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

  constructor(private readonly eventService: EventService) {
  }

  @fluffyCatch()
  async ngOnInit() {
    if (!this.eventId) {
      return;
    }
    this.userEvents = await this.eventService.getUserEvents(this.eventId);
    this.filter();
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
}
