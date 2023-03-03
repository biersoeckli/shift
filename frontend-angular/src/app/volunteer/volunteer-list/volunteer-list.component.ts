import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { CsvExporterService } from 'src/app/shift-common/services/csv-exporter.service';
import { EventService } from 'src/app/shift-common/services/event.service';

enum VolunteerDisplayFilter {
  all,
  volunteersWithShift,
  volunteersWithoutShift
}

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

  VolunteerDisplayFilter = VolunteerDisplayFilter;
  activeFilter = VolunteerDisplayFilter.all;
  userShiftPromise?: Promise<Parse.Object<Parse.Attributes>[]>;

  constructor(private readonly eventService: EventService) {
  }

  @fluffyCatch()
  async ngOnInit() {
    if (!this.eventId) {
      return;
    }
    this.userEvents = await this.eventService.getUserEvents(this.eventId);
    this.userShiftPromise = this.eventService.getAllUserShifts(this.eventId);
    this.filter();
  }

  async filter() {
    if (!this.searchTerm) {
      this.filteredUserEvents = this.userEvents;
    }
    let userEvents = this.userEvents ?? [];
    if (this.activeFilter !== VolunteerDisplayFilter.all) {
      const userShiftsIds = (await this.userShiftPromise ?? []).map(userShift => userShift.get('user').id);
      if (this.activeFilter === VolunteerDisplayFilter.volunteersWithShift) {
        userEvents = userEvents.filter(userEvent => userShiftsIds.includes(userEvent.get('user').id));
      }
      if (this.activeFilter === VolunteerDisplayFilter.volunteersWithoutShift) {
        userEvents = userEvents.filter(userEvent => !userShiftsIds.includes(userEvent.get('user').id));
      }
    }

    this.filteredUserEvents = userEvents.filter(userEvent =>
      `${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')}`.toLocaleLowerCase()
        .includes(this.searchTerm.toLocaleLowerCase()));
  }

  changeFilter(selectedFilter: VolunteerDisplayFilter) {
    this.activeFilter = selectedFilter;
    this.filter();
  }

  selectUser(userEvent: Parse.Object<Parse.Attributes>) {
    this.userEventSelected.next(userEvent);
  }
}
