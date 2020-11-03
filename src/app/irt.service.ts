import { Injectable, Inject } from '@angular/core';
import { Item } from './item';
import { Map } from './map';


@Injectable()
export class IRTService {

	constructor() {}

	setNormalDistribution(): Array<number> {

		var mean = 0.0;
		var stdev = 1.0;
		var min = -6.0;
		var max = 6.0;
		var interval = (max - min)/100.0;

		var QuadraturePoints = new Array();
		var Distrib = new Array();
		for(var k=0; k < 101; k++){
			QuadraturePoints.push( min + interval * k );
		}

		for(var k=0; k < QuadraturePoints.length; k++){
			var tmp = (QuadraturePoints[k] - mean) / stdev;
			Distrib.push( 1 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * tmp * tmp) );
		}

		return Distrib;

	}

	setUniformDistribution(): Array<number> {

		var min = -6.0;
		var max = 6.0;
		var interval = (max - min)/100.0;

		var QuadraturePoints = new Array();
		var Distrib = new Array();
		for(var k=0; k < 101; k++){
			QuadraturePoints.push( min + interval * k );
		}

		for(var k=0; k < QuadraturePoints.length; k++){
			Distrib.push( 0.0 );
		}

		return Distrib;

	}

	getEAPLog(items: Array<Item>): number{

		var initialLikelyhood = this.setUniformDistribution();
		var likelyhood = new Array();

		var min = -6.0;
		var max = 6.0;
		var interval = (max - min)/100.0;

		var QuadraturePoints = new Array();
		for(var k=0; k < initialLikelyhood.length; k++){
			QuadraturePoints.push( min + interval * k );
			likelyhood[k] = initialLikelyhood[k];
		}


		for(var i = 0 ; i < items.length; i++){
			var slope = parseFloat(items[i].Slope);
			var maps = items[i].Maps;
			var responseCategory = this.getAdjustedCategory(maps, items[i].AnsweredItemResponseOID);

			var responseValue = 0;

			for(var m=0; m < maps.length; m++){
				if(items[i].AnsweredItemResponseOID == maps[m].ItemResponseOID ){
					responseValue = parseInt(maps[m].Value);
					break;				
				}
			}

			for(var j=0; j < QuadraturePoints.length; j++){
				var prob = this.calculateCumulativeProbability(slope, QuadraturePoints[j], maps);
				likelyhood[j] = likelyhood[j] +  Math.log((prob[responseValue -1] - prob[responseValue] ));
			}
		}

		// 2019-07-10 calculate Maximum of LogLikelyhood
		var likelyMax = 0.0;
		for(var j=0; j < QuadraturePoints.length; j++){
			if(likelyhood[j] > likelyMax){
				likelyMax = likelyhood[j];
			}
		}

		for(var j=0; j < QuadraturePoints.length; j++){
			likelyhood[j] = likelyhood[j] - likelyMax - 0.5/(3.0*3.0*QuadraturePoints[j]*QuadraturePoints[j]);
		}


		var Z = 0.0;
		for(var j=0; j < likelyhood.length; j++){

			if(j==0){
				Z = Z  + Math.exp(likelyhood[j]);
			} else if(j == likelyhood.length-1){
				Z = Z  + Math.exp(likelyhood[j]);
			}else{
				Z = Z  + Math.exp(likelyhood[j]) * 2.0;
			}
		}


		var m = 0.0
		for(var j=0; j < likelyhood.length; j++){
			if(j==0){
				m = m  + QuadraturePoints[j] * Math.exp(likelyhood[j]);
			} else if(j == likelyhood.length-1){
				m = m  + QuadraturePoints[j] * Math.exp(likelyhood[j]);
			}else{
				m = m  + 2.0 * QuadraturePoints[j] * Math.exp(likelyhood[j]);
			}
		}
		
		// 2019-07-10 

		return  m/Z;		
/*
		var likelyhoodSum = 0.0;
		var likelyhoodWeightedSum = 0.0;
		for(var j=0; j < likelyhood.length; j++){
			likelyhoodSum = likelyhoodSum +  likelyhood[j];
			likelyhoodWeightedSum = likelyhoodWeightedSum  + (likelyhood[j]*QuadraturePoints[j]);
		}

		return -1.0 * likelyhoodWeightedSum/likelyhoodSum;
*/		
	}

	getEAP(items: Array<Item>): number{

		var initialLikelyhood = this.setNormalDistribution();
		var likelyhood = new Array();

		var min = -6.0;
		var max = 6.0;
		var interval = (max - min)/100.0;

		var QuadraturePoints = new Array();
		for(var k=0; k < initialLikelyhood.length; k++){
			QuadraturePoints.push( min + interval * k );
			likelyhood[k] = initialLikelyhood[k];
		}


		for(var i = 0 ; i < items.length; i++){
			var slope = parseFloat(items[i].Slope);
			var maps = items[i].Maps;
			var responseCategory = this.getAdjustedCategory(maps, items[i].AnsweredItemResponseOID);

			var responseValue = 0;

			for(var m=0; m < maps.length; m++){
				if(items[i].AnsweredItemResponseOID == maps[m].ItemResponseOID ){
					responseValue = parseInt(maps[m].Value);
					break;				
				}
				//console.log(m + " : " + maps[m].Value + " : " + maps[m].ItemResponseOID + " : " +  responseCategory + " : " + maps[m].ResponseOption  + " : " + maps[m].Position + " : " + items[i].AnsweredItemResponseOID);
			}

			for(var j=0; j < QuadraturePoints.length; j++){
				var prob = this.calculateCumulativeProbability(slope, QuadraturePoints[j], maps);

				// TODO:  need to get the correct response probabilty based on response option.
				// IS IT prob[]  or maybe Likelyhood_item.

				//var responseProb = this.Likelyhood_item (slope, prob, responseCategory );
				//likelyhood[j] = likelyhood[j] * responseProb;
				//likelyhood[j] = likelyhood[j] * (prob[responseCategory -1] - prob[responseCategory] );
				likelyhood[j] = likelyhood[j] * (prob[responseValue -1] - prob[responseValue] );
			}
		}


		var likelyhoodSum = 0.0;
		var likelyhoodWeightedSum = 0.0;
		for(var j=0; j < likelyhood.length; j++){
			likelyhoodSum = likelyhoodSum +  likelyhood[j];
			likelyhoodWeightedSum = likelyhoodWeightedSum  + (likelyhood[j]*QuadraturePoints[j]);
		}

		return likelyhoodWeightedSum/likelyhoodSum;
	}

  	information2 (slope: number, cumulativeP: Array<number>) : number {
   		var sum = 0.0;
		for(var k=1; k < cumulativeP.length; k++){
			var term1 = cumulativeP[k -1] * (1.0 - cumulativeP[k -1]);
			var term2 = cumulativeP[k] * (1.0 - cumulativeP[k]); 
			var num = slope * (term1 - term2);
			sum = sum + Math.pow(num,2)/(cumulativeP[k-1] - cumulativeP[k]);
		}
		return sum; 	
  	}

  	getAdjustedCategory(maps: Array<Map>, ItemResponseOID: string) : number {


		var adjustedCategory = 1;
		for(var j =0; j < maps.length; j++){
	  		if(ItemResponseOID == maps[j].ItemResponseOID){
	  			break;
			}
			if( parseFloat(maps[j].Calibration) != NaN && maps[j].Calibration != "" ){
				if(j >0 && (maps[j].Calibration == maps[j-1].Calibration)){ continue;}	
				adjustedCategory = adjustedCategory + 1;
			}
		}

		return adjustedCategory;
  	}


  	calculateCumulativeProbability(slope: number, initialTheta: number, maps: Array<Map>) : Array<number> {


		maps.sort((a,b) => parseFloat(a.Calibration) - parseFloat(b.Calibration) )

  		var cumulativeP = new Array();
		cumulativeP.push(1.0);
		for(var j=0; j < maps.length ; j++){
			if( maps[j].Calibration != ""){

				//check for collapsed categories
				if(j >0 && (maps[j].Calibration == maps[j-1].Calibration)){ continue;}

				cumulativeP.push( 1/ ( 1 + Math.pow(Math.E,(slope * (parseFloat(maps[j].Calibration) - initialTheta)))) ) ;
			}
		}
		cumulativeP.push(0.0);
  		return cumulativeP;
  	}

  	Likelyhood_item0 (slope: number, cumulativeP: Array<number>, category: number) : number {

  		//mat_p = self.prob(trait)[:, 0:-1] - self.prob(trait)[:, 1:]
        //mat_log = np.log(mat_p * (mat_p > 0) + (mat_p <= 0))
        //l = np.trace(np.dot(self.responses, mat_log.T)) # log-likelihood
        // Math.log(t)


  		if(category == (cumulativeP.length -1) ){
  			var mat_p = cumulativeP[0] + cumulativeP[1];
  			return Math.log(mat_p);
  		}
		var mat_p = cumulativeP[category] + cumulativeP[category +1];

  		return Math.log(mat_p);

  	}

  	Likelyhood_item (slope: number, cumulativeP: Array<number>, category: number) : number {

  		if(category == (cumulativeP.length -1) ){
  			return slope * (1.0 - (cumulativeP[0] + cumulativeP[1]));
  		}

  		return slope * (1.0 - (cumulativeP[category] + cumulativeP[category +1]))

  	}


  	Likelyhood_item_2 (slope: number, cumulativeP: Array<number>, category: number) : number {

		/*
            mat_p = (self.prob(trait, 1)[:, 0:-1] + self.prob(trait, 1)[:, 1:])

            return np.dot((self.slope ** 2),
                          np.diagonal(np.dot(self.responses, mat_p.T)))


             p ** 2. - p
         */                 


  		if(category == (cumulativeP.length -1) ){
  			var P0 = Math.pow(cumulativeP[0],2) - cumulativeP[0];
  			var P1 = Math.pow(cumulativeP[1],2) - cumulativeP[1];
  			return Math.pow(slope,2) * (P0 + P1);
  		}

		var PK = Math.pow(cumulativeP[category],2) - cumulativeP[category];
		var PK1 = Math.pow(cumulativeP[category +1],2) - cumulativeP[category +1];

		return Math.pow(slope,2) * (PK + PK1)
  
  	}


  	L0_sum(items: Array<Item>, est: number){

  		var L0 = 0.0;
		for(var i = 0 ; i < items.length; i++){
			var cumulativeP = this.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);
			var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);
			L0 = L0 + this.Likelyhood_item0(itemSlope, cumulativeP, adjustCategory);
		}
		return L0;
  	}

  	L1_sum(items: Array<Item>, est: number){

  		var L1 = 0.0;
		for(var i = 0 ; i < items.length; i++){
			var cumulativeP = this.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);
			var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);
			L1 = L1 + this.Likelyhood_item(itemSlope, cumulativeP, adjustCategory);
		}
		return L1;
  	}

  	L1_sum2(items: Array<Item>, est: number){

  		var L1 = 0.0;
		for(var i = 0 ; i < items.length; i++){
			var cumulativeP = this.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);
			var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);
			L1 = L1 + this.Likelyhood_item_2(itemSlope, cumulativeP, adjustCategory);
		}
		return L1;
  	}

  	L2 (slope: number, cumulativeP: Array<number>, category: number) : number {
  		var rtn = 0.0;
  		var t1 = this.firstDerivative(cumulativeP);
  		//rtn = Math.pow(slope,2) * (t1[category] + t1[category +1]);
  		rtn = Math.pow(slope,2) * (t1[category-1] + t1[category]);
  		return rtn;
  	}

  	L2_sum(items: Array<Item>, est: number){

  		var L2 = 0.0;
		for(var i = 0 ; i < items.length; i++){
			var itemSlope = parseFloat(items[i].Slope);
			var cumulativeP = this.calculateCumulativeProbability(itemSlope, est, items[i].Maps);
			var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);		
			L2 = L2 + this.L2(itemSlope, cumulativeP, adjustCategory);
		}
		return L2;
  	}

  	firstDerivative(prob: Array<number>) : Array<number> {

  		var sum = new Array();
  		//sum.push(0.0);
  		for(var i=1; i < prob.length; i++){
  			sum.push(Math.pow(prob[i-1],2) - prob[i-1]);
  		}
  		sum.push(0.0);
  		return sum;
  	}

  	secondDerivative(slope: number, prob: Array<number>) : Array<number> {

  		var sum = new Array();
  		//sum.push(0.0);
  		for(var i=1; i < prob.length; i++){
  			sum.push( 2.0*Math.pow(prob[i-1],3) - 3.0*Math.pow(prob[i-1],2) + prob[i-1] );
  		}
  		sum.push(0.0);
  		return sum;
  	}

  	secondDerivative2(prob: Array<number>) : Array<number> {

  		var sum = new Array();
  		//sum.push(0.0);
  		for(var i=1; i < prob.length; i++){
  			sum.push( 2.0*Math.pow(prob[i-1],3) - 3.0*Math.pow(prob[i-1],2) + prob[i-1] );
  		}
  		sum.push(0.0);
  		return sum;
  	}



  	thirdDerivative(slope: number, prob: Array<number>) : Array<number> {

  		var sum = new Array();
  		//sum.push(0.0);
  		for(var i=1; i < prob.length; i++){
  			sum.push( 6.0*Math.pow(prob[i-1],4) - 12.0*Math.pow(prob[i-1],3) + 7.0*Math.pow(prob[i-1],2) - prob[i-1] );
  		}
  		sum.push(0.0);
  		return sum;
  	}


  	thirdDerivative2(prob: Array<number>) : Array<number> {

  		var sum = new Array();
  		//sum.push(0.0);
  		for(var i=1; i < prob.length; i++){
  			sum.push( 6.0*Math.pow(prob[i-1],4) - 12.0*Math.pow(prob[i-1],3) + 7.0*Math.pow(prob[i-1],2) - prob[i-1] );
  		}
  		sum.push(0.0);
  		return sum;
  	}


  	 wml_est1 (items: Array<Item>, est: number) : number {

  	 	var rtn = 0.0;
  	 	var LikelyhoodSlope = this.L1_sum(items, est);
  	 	var information = 0.0
		var p1_sum = 0.0;
		var term21 = 0.0;

  	 	for(var i = 0 ; i < items.length; i++){
	  	 	var cumulativeP = this.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);

	  	 	var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);
	  	 	information = information + this.information2(itemSlope,cumulativeP);


			var first = this.firstDerivative( cumulativeP );
			var second = this.secondDerivative( itemSlope, cumulativeP );
			var third = this.thirdDerivative( itemSlope, cumulativeP );

	  		var array00 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array00.push((cumulativeP[k-1] + cumulativeP[k])); 
	  		}

	  		var array01 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array01.push((cumulativeP[k-1] - 1.0 * cumulativeP[k])); 
	  		}

	  		var array10 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array10.push( (this.firstDerivative(cumulativeP)[k-1] + this.firstDerivative(cumulativeP)[k]) ); 
	  		}

	  		var array11 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array11.push( (this.firstDerivative(cumulativeP)[k-1] - 1.0 * this.firstDerivative(cumulativeP)[k]) ); 
	  		}

	  		var array20 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array20.push( (this.secondDerivative2(cumulativeP)[k-1] + this.secondDerivative2(cumulativeP)[k]) ); 
	  		}

	  		var array21 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array21.push( (this.secondDerivative2(cumulativeP)[k-1] - 1.0 * this.secondDerivative2(cumulativeP)[k]) ); 
	  		}

	  		var array31 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array31.push( (this.thirdDerivative2(cumulativeP)[k-1] - 1.0 * this.thirdDerivative2(cumulativeP)[k]) ); 
	  		}

			// p1 = np.dot((self.slope ** 3),np.diagonal(np.dot(1. - mats[0][0], mats[2][1].T)))
			var p1 = 0.0;
			for(k=0; k < array00.length;k++){
				p1 = p1 + (1.0 - array00[k]) * array21[k] 
			}
			p1 = p1 * Math.pow(itemSlope ,3);

			//p2 = np.dot((self.slope ** 4), np.diagonal(np.dot(mats[1][0], mats[2][1].T) - np.dot(1. - mats[0][0], mats[3][1].T)))
			var p2 = 0.0;
			for(k=0; k < array00.length;k++){
				p2 = p2 + (array10[k] * array21[k]) - ((1.0 - array00[k]) *  array31[k]);  
			}
			p2 = p2 * Math.pow(itemSlope ,4);

		    //p3 = np.dot((self.slope ** 3), np.diagonal(np.dot(mats[1][1], mats[1][0].T) + np.dot(mats[0][1], mats[2][0].T)))
			var p3 = 0.0;
			for(k=0; k < array00.length;k++){
				p3 = p3 + (array11[k] * array10[k]) + (array01[k] *  array20[k]);  
			}
			p3 = p3 * Math.pow(itemSlope ,3);


		  	p1_sum = p1_sum + p1;

			//var term21 = p1 / (2 * information)
			//term21 = term21 +  p1_sum / (2 * information)

			//term21 = term21 +  p1 / (2 * information)			
			//rtn = rtn + LikelyhoodSlope + term21;
	    }	

		term21 = p1_sum / (2 * information)			
		rtn = LikelyhoodSlope + term21;
        // console.log("trait=" + est + " term1=" +  LikelyhoodSlope + " fisher=" +  information + " p1=" +  p1_sum + " term2=" + term21 + " wml1=" + rtn)
	    return rtn;

  	 }

  	 wml_est2 (items: Array<Item>, est: number) : number {

  	 	var rtn = 0.0;
  	 	var rtn = 0.0;
  	 	var LikelyhoodSlope2 = this.L1_sum2(items, est)
  	 	var information = 0.0
		var p1_sum = 0.0;
		var p2_sum = 0.0;
		var p3_sum = 0.0;
		var term2 = 0.0;

  	 	for(var i = 0 ; i < items.length; i++){
	  	 	var cumulativeP = this.calculateCumulativeProbability(parseFloat(items[i].Slope), est, items[i].Maps);

	  	 	var adjustCategory = this.getAdjustedCategory(items[i].Maps, items[i].AnsweredItemResponseOID);
			var itemSlope = parseFloat(items[i].Slope);
	  	 	information = information + this.information2(itemSlope,cumulativeP);

			var first = this.firstDerivative( cumulativeP );
			var second = this.secondDerivative( itemSlope, cumulativeP );
			var third = this.thirdDerivative( itemSlope, cumulativeP );

	  		var array00 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array00.push((cumulativeP[k-1] + cumulativeP[k])); 
	  		}

	  		var array01 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array01.push((cumulativeP[k-1] - 1.0 * cumulativeP[k])); 
	  		}

	  		var array10 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array10.push( (this.firstDerivative(cumulativeP)[k-1] + this.firstDerivative(cumulativeP)[k]) ); 
	  		}

	  		var array11 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array11.push( (this.firstDerivative(cumulativeP)[k-1] - 1.0 * this.firstDerivative(cumulativeP)[k]) ); 
	  		}

	  		var array20 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array20.push( (this.secondDerivative2(cumulativeP)[k-1] + this.secondDerivative2(cumulativeP)[k]) ); 
	  		}

	  		var array21 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array21.push( (this.secondDerivative2(cumulativeP)[k-1] - 1.0 * this.secondDerivative2(cumulativeP)[k]) ); 
	  		}

	  		var array31 = new Array();
	  		for(var k =1; k < cumulativeP.length; k++){
	  			array31.push( (this.thirdDerivative2(cumulativeP)[k-1] - 1.0 * this.thirdDerivative2(cumulativeP)[k]) ); 
	  		}

			// p1 = np.dot((self.slope ** 3),np.diagonal(np.dot(1. - mats[0][0], mats[2][1].T)))
			var p1 = 0.0;
			for(k=0; k < array00.length;k++){
				p1 = p1 + (1.0 - array00[k]) * array21[k] 
			}
			p1 = p1 * Math.pow(itemSlope ,3);

			//p2 = np.dot((self.slope ** 4), np.diagonal(np.dot(mats[1][0], mats[2][1].T) - np.dot(1. - mats[0][0], mats[3][1].T)))
			var p2 = 0.0;
			for(k=0; k < array00.length;k++){
				p2 = p2 + (array10[k] * array21[k]) - ((1.0 - array00[k]) *  array31[k]);  
			}
			p2 = p2 * Math.pow(itemSlope ,4);

		    //p3 = np.dot((self.slope ** 3), np.diagonal(np.dot(mats[1][1], mats[1][0].T) + np.dot(mats[0][1], mats[2][0].T)))
			var p3 = 0.0;
			for(k=0; k < array00.length;k++){
				p3 = p3 + (array11[k] * array10[k]) + (array01[k] *  array20[k]);  
			}
			p3 = p3 * Math.pow(itemSlope ,3);

		  	
		  	p1_sum = p1_sum + p1;
		  	p2_sum = p2_sum + p2;
		  	p3_sum = p3_sum + p3;

		  	//var term2 = (p2 / (2 * information)) - (LikelyhoodSlope2 * p3 / (2 * (Math.pow(information,2))))
			//term2 = term2 +  (p2_sum / (2 * information)) - (LikelyhoodSlope2 * p3_sum / (2 * (Math.pow(information,2))))

			//term2 = term2 +  (p2 / (2 * information)) - (LikelyhoodSlope2 * p3 / (2 * (Math.pow(information,2))))
			//rtn = rtn + LikelyhoodSlope2 + term2;
	    }
	    //term2 = (p2 / (2 * fish)) - (p1 * p3 / (2 * (fish ** 2)))
		term2  =  (p2_sum / (2 * information)) - (p1_sum * p3_sum / (2 * (Math.pow(information,2))))
	    rtn = LikelyhoodSlope2 + term2;

		// console.log("trait= " + est + " term1= " +  LikelyhoodSlope2 + " fisher= " +  information + " p2= " +  p2_sum + " p3= " +  p3_sum + " term2= " + term2 + " wml2= " + rtn );
	    return rtn;

  	 }

}