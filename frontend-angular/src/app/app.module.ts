import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { ShiftCommonModule } from './shift-common/shift-common.module';

@NgModule({
  declarations: [
    AppComponent,
    GlobalLoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ShiftCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
