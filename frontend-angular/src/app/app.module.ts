import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { ShiftCommonModule } from './shift-common/shift-common.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { GlobalAlertComponent } from './global-alert/global-alert.component';

@NgModule({
  declarations: [
    AppComponent,
    GlobalLoaderComponent,
    HomeComponent,
    GlobalAlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ShiftCommonModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
