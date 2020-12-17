import { Injectable, Inject } from '@angular/core';

import { Item } from './item';
import { Map } from './map';
import { FORMS } from './forms';
import { Form } from './form';
import { Assessment } from './assessment';
import { Response } from './response';
import { Result } from './result';
import { Demographic } from './demographic';
import { IRTService } from './irt.service';


@Injectable()
export class CatService {

	private _domain_finished = false;
	private _answered_items = 0;

	private assessments = Array<Assessment>();
	private results = Array<Result>();
	private responses = Array<Response>();
	private forms = Array<Form>();
	private demo;

	private exlusion_code = 0;


	constructor(private irt: IRTService) {}

  	set_exlusion_code(demo:Demographic){

  		this.demo = demo;

		var bitsum = 0;

		if (demo.wc == 1){
		  //WheelChair = All the time; I never walk
		  bitsum = bitsum + 2;
		  //console.log("wheelchair");
		}
		if (demo.walking == 2){
		  //Walking Aid = Never
		  bitsum = bitsum + 4;
		  //console.log("walking");
		}
		if (demo.gender == 0){
		  //Gender = Female
		  bitsum = bitsum + 16;
		  //console.log("female");
		}
		if (demo.gender == 1){
		  //Gender = Male
		  bitsum = bitsum + 32;
		  //console.log("male");
		}
		if (demo.gender == 2){
		  //Gender = Refused
		  bitsum = bitsum + 64;
		  //console.log("gender:refused");
		}

		if ((demo.race & 1) != 1){
		  //Race <> White
		  bitsum = bitsum + 1024;
		  //console.log("Race <> White");
		}
		if ((demo.race & 1) == 1){
		  //Race == White
		  bitsum = bitsum + 2048;
		  //console.log("Race == White");
		}
		if ((demo.race & 64) == 64){
		  //Race is not provided
		  bitsum = bitsum + 4096;
		  //console.log("Race not provided");
		}

		if(demo.drive == 0){
		  bitsum = bitsum + 8192;
		}
		if(demo.public_transportation == 0){
		  bitsum = bitsum + 16384;
		}
		this.exlusion_code = bitsum;
		console.log(this.exlusion_code);

  }

  getResults(): Array<Result> {
  	return this.results;
  }

  getForms(): Array<Form> {
  	return this.forms;
  }

  setForms() {

    for(var j=0; j < FORMS.length; j++){

      let _form = new Form();
      _form.FormOID = FORMS[j].FormOID;
      _form.ID = FORMS[j].ID;
      _form.Name = FORMS[j].Name;
      _form.Domain = FORMS[j].Domain;
      _form.Items = [];

      for (var item of FORMS[j].Items) {  
        if( parseInt(item.Operator) != 0 && (parseInt(item.Operator) & this.exlusion_code) > 0 ){
        }else{
          _form.Items.push(item);
        }
      }   
      this.forms.push(_form);
    }


  }

  saveResponse(response: Response){
	this.responses.push(response);
  }

  saveResults(result: Result){
	this.results.push(result);
  }

  getAssessments(): Array<Assessment> {
  	return this.assessments;
  }

  initializeAssessments(){

  	  var startDomain = Math.floor(Math.random() * Math.floor(2));
  	  var behavior = [];
  	  
      behavior.push({"ID":4,"Domain":"Cognition & Communication","Active":false, "Started":null, "Finished":null});
	    behavior.push({"ID":5,"Domain":"Resilience & Sociability","Active":false, "Started":null, "Finished":null});
	    behavior.push({"ID":6,"Domain":"Self-Regulation","Active":false, "Started":null, "Finished":null});
	    behavior.push({"ID":7,"Domain":"Mood & Emotions","Active":false, "Started":null, "Finished":null});
  
    	var behavior_currentIndex = behavior.length;
    	var behavior_temporaryValue;
    	var behavior_randomIndex;
	
    	while (0 !== behavior_currentIndex) {
    		behavior_randomIndex = Math.floor(Math.random() * behavior_currentIndex);
    		behavior_currentIndex -= 1;
    
    		// And swap it with the current element.
    		behavior_temporaryValue = behavior[behavior_currentIndex];
    		behavior[behavior_currentIndex] = behavior[behavior_randomIndex];
    		behavior[behavior_randomIndex] = behavior_temporaryValue;
     	}

  		var phy = [];  
	    phy.push({"ID":0,"Domain":"Basic Mobility","Active":false, "Started":null, "Finished":null});
	    phy.push({"ID":1,"Domain":"Upper Body Function","Active":false, "Started":null, "Finished":null});
	    phy.push({"ID":2,"Domain":"Fine Motor Function","Active":false, "Started":null, "Finished":null});
	    phy.push({"ID":3,"Domain":"Community Mobility","Active":false, "Started":null, "Finished":null});
	    phy.push({"ID":8,"Domain":"Wheelchair","Active":false, "Started":null, "Finished":null});	  
  	
  		if(this.demo.wc == 2){
    	  phy.splice(4,1);
	    }
	    
	    if(this.demo.public_transportation === 0 && this.demo.drive === 0){
        	phy.splice(3,1);
      	}
	    
	    // if(this.demo.wc == 1){
    	//   phy.splice(0,1);
	    // }  
	    
	  	var phy_currentIndex = phy.length;
		var phy_temporaryValue;
		var phy_randomIndex;

		while (0 !== phy_currentIndex) {
			phy_randomIndex = Math.floor(Math.random() * phy_currentIndex);
			phy_currentIndex -= 1;

			// And swap it with the current element.
			phy_temporaryValue = phy[phy_currentIndex];
			phy[phy_currentIndex] = phy[phy_randomIndex];
			phy[phy_randomIndex] = phy_temporaryValue;
		}

		if( startDomain === 0 ){
			for (var i = 0; i < behavior.length; i++) {
				this.assessments.push(behavior[i]);
			}
			for (var j = 0; j < phy.length; j++) {
				this.assessments.push(phy[j]);
			}
		}else{
			for (var k = 0;k < phy.length; k++) {
				this.assessments.push(phy[k]);
			}

			for (var l = 0; l < behavior.length; l++) {
				this.assessments.push(behavior[l]);
			}
		}	

  }
	

	setAssessments(): Array<Assessment>{

		let assessment = this.assessments.filter((a) => a.Active === true); // array of current assessment

		if(assessment.length == 0){ // No current assessment found
			assessment[0] = this.assessments[0];		
		}

		let filtered_results = this.results.filter((a) => a.oid === assessment[0].Domain);

		// determine if need to get the next assessment
		if ( (this._answered_items > 5 && filtered_results[ filtered_results.length -1 ].error < 0.3873) || this._answered_items >= 10 || this._domain_finished ) {
			this._domain_finished = false;
			this._answered_items = 0;

			for(var i = 0; i < this.assessments.length; i++){			
				if(this.assessments[i].Active == true){
					this.assessments[i].Active = false;
					this.assessments[i].Finished = Date.now();
					if( (i+1) == this.assessments.length){
						assessment = null;						
					}else{
						assessment[0] = this.assessments[i + 1];					
					}
					break;
				}
			}

		}
		return assessment;

	}

	getNextItemSync(): Item {

		let assessment = this.setAssessments();

		if(assessment == null){
			return null;
		}

		if(assessment[0].Started == null){
			assessment[0].Started = Date.now();
		}

		assessment[0].Active = true;
		

		let forms = this.forms.filter( (e) => e.Domain === assessment[0].Domain);

		if(forms.length == 0){
			return null;
		}else{
			var _item = this.calculateNextItem(forms[0]);
			if(_item == null){
				this._domain_finished = true;
			}
			return _item;
		}

  	}


  	calculateNextItem(form: Form) : Item {

  		var initialTheta = 0.0;
  		var information = 0.0;

  		var cumulativeP = new Array();
  		var informationSet = new Array();

  		for(var i=0; i < form.Items.length; i++){
  			
			let Calibrations = form.Items[i].Maps.filter((a) => a.Calibration).sort((a,b) => parseFloat(a.Calibration) - parseFloat(b.Calibration) );

			cumulativeP = this.irt.calculateCumulativeProbability(parseFloat(form.Items[i].Slope), initialTheta, Calibrations);

  			if(!form.Items[i].Administered){
  				informationSet.push({'id':i, 'information': this.irt.information2 (parseFloat(form.Items[i].Slope),cumulativeP)});
  			}

		}
		
		if(informationSet.length == 0){
			return null;
		}

		informationSet.sort((a,b) => parseFloat(b.information) - parseFloat(a.information) );

	
		var formID = 0;
		var itemID = 0;
		for(var x=0; x < this.forms.length; x++ ){
			if( this.forms[x].Domain == form.Domain ){
				this.forms[x].Items[informationSet[0].id].Administered = true;
			}
		}

		var randomIndex = Math.floor(Math.random() * 4);
		if(informationSet.length < 6){
			randomIndex = 0;
		}

		form.Items[informationSet[randomIndex].id].Administered = true;
		return form.Items[informationSet[randomIndex].id];
		
  	}


  	calculateEstimateSync() : Result {
 
		let assessment = this.assessments.filter((a) => a.Active === true);
		let forms = this.forms.filter( (e) => e.Domain === assessment[0].Domain);
		let responseProperties = new Array<Item>();

		for(var i = 0 ; i < this.responses.length; i++){
			let item = forms[0].Items.filter((a) => a.ID === this.responses[i].ID)
			if(item.length > 0){
				item[0].AnsweredItemResponseOID = this.responses[i].ItemResponseOID;

				if( !this.skipScoring(item[0]) ){
					responseProperties.push(item[0]);
				}
			}
		}

		if(this.responses[this.responses.length -1].Value != '8'){
			this._answered_items = this._answered_items + 1;
		}


		var ItemID = this.responses[this.responses.length -1].ID;
		
		return this.calculateGRM(responseProperties, forms[0].Domain, ItemID);
  	}

  	skipScoring(item: Item): boolean {

  		var rtn = false;
		let map = item.Maps.filter((a) => a.ItemResponseOID === item.AnsweredItemResponseOID);

  		if(map.length > 0  && map[0].Value == '8'){
  			rtn = true;
  		}
  		return rtn;

  	}

  	calculateGRM_EAP(items: Array<Item>, FormID: string, ItemID: string): Result {

  		if(items.length == 0){
  			return new Result();
  		}

		var EAP = this.EAP(items);
		var SE = this.irt.L2_sum(items, EAP);

		var _result = new Result();
		_result.oid = FormID;
		_result.ItemID = ItemID;
		_result.score = EAP;
		_result.error = 1.0/Math.sqrt(-1.0*SE);

		_result.fit = this.person_fit(items, EAP);

  		return _result;

  	}

  	EAP(items: Array<Item>): number{

  		var rtn = 0.0;
		for(var i = 0 ; i < items.length; i++){
			//var cumulativeP = this.irt.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);
	
			//var adjustCategory = this.irt.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);

		}
  		return rtn;
  	}


  	calculateGRM(items: Array<Item>, FormID: string, ItemID: string): Result {


		var EAP = this.irt.getEAP(items);

  		if(items.length == 0){

			var no_result = new Result();
			no_result.oid = FormID;
			no_result.ItemID = ItemID;
  			return no_result;
  		}

		var SE = this.irt.L2_sum(items, EAP);

		var _result = new Result();
		_result.oid = FormID;
		_result.ItemID = ItemID;
		_result.score = EAP;
		_result.error = 1.0/Math.sqrt(-1.0*SE);
		_result.fit = this.person_fit(items, EAP);

  		return _result;

  	}


  	bisectionMethod_bias(items: Array<Item>, FormID: string): number {

  	  	var theta_lower = -6.0;
  		var theta_upper = 6.0;
  		var rtn = (theta_lower + theta_upper)/2.0;
  		var rtn = theta_lower;
		var theta_estimate = -6.0;
		var bias = 0.0;
		var _bias = 0.0;

  		for(var loop = 0; loop < 1000; loop++){
			var LikelyhoodSlope = this.irt.L1_sum(items, rtn);

			_bias = this.calculateBias(items, rtn, LikelyhoodSlope);

			if( _bias == NaN ){
				_bias = 0.0;
				console.log(" bias is NaN ");
			}

			if( _bias > 0.0){
	  			theta_lower = rtn;
	  		}else{
	  			theta_upper = rtn;
	  		}
	  		rtn = (theta_lower + theta_upper)/2.0;


		  	if(Math.abs(theta_estimate - rtn) < .0001){
    			break;
	  		}else{
	  			theta_estimate = rtn;
	  		}
  		}

		return rtn;
  	}

  	calculateBias(items: Array<Item>, est: number, likelyhood: number) : number {

  		var sum = 0.0;
  		var information = 0.0;

		for(var i = 0 ; i < items.length; i++){

			var item_sum = 0.0;
			var cumulativeP = this.irt.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);
	
			var adjustCategory = this.irt.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);

			var first = this.irt.firstDerivative( cumulativeP );
			var second = this.irt.secondDerivative( itemSlope, cumulativeP );
			information = information + this.irt.information2(itemSlope,cumulativeP);

	  		var array00 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array00.push((cumulativeP[k-1] + cumulativeP[k])); 
	  		}
	  		var array21 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array21.push( (this.irt.secondDerivative2(cumulativeP)[k-1] - 1.0 * this.irt.secondDerivative2(cumulativeP)[k]) ); 
	  		}

        	// p1 = np.dot((self.slope ** 3),np.diagonal(np.dot(1. - mats[0][0], mats[2][1].T)))
        	for(k=0; k < array00.length;k++){
        		item_sum = item_sum  + (1.0 - array00[k]) * array21[k] 
        	}

			item_sum = item_sum * Math.pow(itemSlope ,3);
			sum = sum + item_sum;

		}
		//console.log("est: " + (likelyhood + sum/(2.0 * information)) + " trait: " + est + " term1: " + likelyhood + " term2: " + sum/(2.0 * information));
		return likelyhood + sum/(2.0 * information);
  	}

  	person_fit(items: Array<Item>, est: number) : number {

  
  		var e = 0.0;
  		var v = 0.0;
		var l = this.irt.L0_sum(items,est);

  		for(var i = 0 ; i < items.length; i++){
  			var e_t = 0.0;
  			var v_t = 0.0;

  			var adjustCategory = this.irt.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
	
			var itemSlope = parseFloat(items[i].Slope);
			var cumulativeP = this.irt.calculateCumulativeProbability(itemSlope, est, items[i].Maps);

			for(var k = 1; k < cumulativeP.length; k++){

				var t = cumulativeP[k-1] - cumulativeP[k]; // verify this is what is needed.

				e_t = e_t + t * Math.log(t);

				for(var j = 1; j < cumulativeP.length; j++){
					var t1 = cumulativeP[j-1] - cumulativeP[j]; // verify this is what is needed.
					v_t = v_t + t * t1 * Math.log(t) * Math.log(t/t1);
				}
			}
			e = e + e_t;
			v = v + v_t;
  		}
  		return (l - e)/Math.sqrt(v);

  	}


  	 newton_rhapson(items: Array<Item>, est: number) : Array<number>{

  	 	var rtn = new Array();
  	 	var diff = 1.0;
  	 	var steps = 0
  	 	var wml = est;

  	 	while (diff > 0.0001){

			var new_est = 0.0;

	  	 	var wml1 = this.irt.wml_est1 (items, est);
	  	 	var wml2 = this.irt.wml_est2 (items, est);

		  	for (var n=0; n < 6; n++){

		  		new_est = est - Math.pow(0.5, n) * (wml1 / wml2);

		  		var information_new = 0.0;
		  		for(var i =0; i < items.length; i++){
		  			var cumulativeP_new = this.irt.calculateCumulativeProbability(parseFloat(items[i].Slope), new_est, items[i].Maps);
		  			information_new = information_new + this.irt.information2(parseFloat(items[i].Slope),cumulativeP_new);
		  		}

		  		var wml1_new = this.irt.wml_est1 (items, new_est);
		  		if( (information_new != 0.0) && (wml1 > wml1_new) ){
		  			break;
		  		}
	  		}
      

            diff = Math.abs(wml - new_est) 
            //se = 1. / np.sqrt(-self.log_l(wml, 2)) 
            wml = new_est
            steps += 1;
      	}

      	rtn[0] = wml;
		rtn[1] = steps;
		return rtn;	             

  	}

}
