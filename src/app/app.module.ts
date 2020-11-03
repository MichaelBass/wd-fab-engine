import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DemographicsComponent } from './demographics/demographics.component';
import { IntroComponent } from './intro/intro.component';
import { AssessmentComponent } from './assessment/assessment.component';

import { CatService } from './cat.service';
import { IRTService } from './irt.service';

@NgModule({
  declarations: [
    AppComponent,
    DemographicsComponent,
    IntroComponent,
    AssessmentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule  
  ],
  providers: [CatService, IRTService],
  bootstrap: [AppComponent]
})
export class AppModule { }
