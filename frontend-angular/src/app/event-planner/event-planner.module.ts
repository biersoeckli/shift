import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events/events.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { EventDetailEditComponent } from './event-detail-edit/event-detail-edit.component';
import { ShiftsModule } from '../shifts/shifts.module';

const routes: Routes = [
  {
    path: 'events',
    component: EventsComponent,
  }, {
    path: 'events/detail',
    component: EventDetailComponent,
  }, {
    path: 'events/detail/edit',
    component: EventDetailEditComponent,
  }, {
    path: 'events',
    loadChildren: () => import('../event-categories/event-categories.module').then(m => m.EventCategoriesModule),
  },
];

@NgModule({
  declarations: [
    EventsComponent,
    EventDetailComponent,
    EventDetailEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    ShiftsModule,
    RouterModule.forChild(routes)
  ]
})
export class EventPlannerModule { }
