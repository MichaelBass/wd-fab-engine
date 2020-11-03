import { Component, OnInit, Inject } from '@angular/core';
import { CatService } from '../cat.service';
import { Item } from '../item';
import { Map } from '../map';
import { Response } from '../response';
import { Result } from '../result';


@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {

	item: Item;
	selectedMap: Map;
	response: Response;
	message: string;
	isDisabled: boolean;

	clear: boolean;

	constructor(private catService: CatService) { }

	ngOnInit() {
		this.getNextItem();
	}

	onSelect(map: Map): void {
		this.selectedMap = map;
		this.isDisabled = false;
	}

	onSubmit(): void {
		this.isDisabled = true;
		this.getResponse();
	}
	
	getNextItem(){

		this.clear = false;
		this.item = this.catService.getNextItemSync();
		if( this.item== null || this.item.ID == undefined ){
		    let assessment2 = this.catService.getAssessments().filter((a) => a.Finished == null); // array of current assessment
		    if(assessment2.length > 0){
		    	this.getNextItem();
		    } else{
		    	console.log(this.catService.getResults());
		    }
			
		}

	}	
	getResponse(): void {
		this.response = new Response();
		this.response.ID = this.item.ID;
		this.response.Prompt = this.item.Prompt;
		this.response.ItemResponseOID = this.selectedMap.ItemResponseOID;
		this.response.Value = this.selectedMap.Value;

		//clear screen;
		this.item.Prompt  = "";
		this.clear = true;
		this.selectedMap = null;

		this.catService.saveResponse(this.response);
		var _result = this.catService.calculateEstimateSync();
		this.catService.saveResults(_result);
		this.getNextItem();

	
	}

}
