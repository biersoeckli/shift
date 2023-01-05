import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesOverviewComponent } from './categories-overview/categories-overview.component';
import { CategoriesEditComponent } from './categories-edit/categories-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'categories',
    component: CategoriesOverviewComponent,
  }, {
    path: 'categories/edit',
    component: CategoriesEditComponent,
  }
];

@NgModule({
  declarations: [
    CategoriesOverviewComponent,
    CategoriesEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EventCategoriesModule { }
