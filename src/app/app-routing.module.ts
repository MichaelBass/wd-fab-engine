import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemographicsComponent } from './demographics/demographics.component';
import { IntroComponent } from './intro/intro.component';
import { AssessmentComponent } from './assessment/assessment.component';

const routes: Routes = [
	{ path: '', redirectTo: '/demographics', pathMatch: 'full' },
	{ path: 'demographics', component: DemographicsComponent },
	{ path: 'intro', component: IntroComponent },
	{ path: 'assessment', component: AssessmentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
