import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerListComponent } from './volunteer-list/volunteer-list.component';
import { VolunteerOverviewComponent } from './volunteer-overview/volunteer-overview.component';
import { VolunteerDetailComponent } from './volunteer-detail/volunteer-detail.component';
import { VolunteerDetailEditComponent } from './volunteer-detail-edit/volunteer-detail-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { Routes, RouterModule } from '@angular/router';
import { EventDetailEditComponent } from '../event-planner/event-detail-edit/event-detail-edit.component';
import { EventDetailComponent } from '../event-planner/event-detail/event-detail.component';
import { EventsComponent } from '../event-planner/events/events.component';

const routes: Routes = [
  {
    path: 'volunteers',
    component: VolunteerOverviewComponent,
  }, {
    path: 'volunteers/detail',
    component: VolunteerDetailComponent,
  }, {
    path: 'volunteers/detail/edit',
    component: VolunteerDetailEditComponent,
  }
];

@NgModule({
  declarations: [
    VolunteerListComponent,
    VolunteerOverviewComponent,
    VolunteerDetailComponent,
    VolunteerDetailEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    VolunteerListComponent
  ]
})
export class VolunteerModule { }
