# wd-fab engine

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.2.

## Typescript Model

forms.ts --  FORMS object is an array of Form object.  Each Form represents a domain assessed.
form.ts -- Form is a collection of items/questions that make up the assessment for a specific domain.
item.ts -- Item represents a specific question that is presented to the user to respond to.
map.ts -- Map represents the question options that an user selects. (all question in wd-fab are multiple choice)
response.ts -- Response represents the answer an user provides to a question.
result.ts -- Result represents the score of a response.  Results are cumulative, so the last result of a form is the final 'score'.
assessment.ts -- Assessment is a state management object for an user during the assessment.
demographic.ts -- Demographic is pre-requisite user-specific data that is used by the wd-fab engine to determine which domains and items should be filter out of an assessment.

## Engine

cat.service.ts -- The main Engine implementation has a dependency on irt.service.ts
irt.service.ts -- Item Response Theory algorithm implementation used for item selection and scoring algorithms.

## wd-fab engine workflow

1.) calulate exlusion_code.  Can use CatService.set_exlusion_code(demo:Demographic)
2.) CatService.setForms(); // filter out items based on exlusion_code
3.) CatService.initializeAssessments(); // randomizes assessment domains and initializes assessment.
4.) CatService.getNextItemSync(); // returns a question/item that is presented to the user.
	Note: if returns null, call CatService.getAssessments() to get the next form/domain.
	if getAssessments returns an empty array. Assessment is done and call CatService.getResults() to get all the scores.

5.) if CatService.getNextItemSync() returns an item, then display to user and capture user response.  
	Create a Response object and call CatService.saveResponse(Response) and Result object CatService.calculateEstimateSync(). 
	After Result object is created, then save it to the CatService.saveResults(Result)

6.) Repeat process by going to step 4.)


## Test Harness

The angular components that are used for demonstrating the wd-fab engine are:

Demographics component demonstrates workflow steps 1 - 3.
Intro component is a transition step with no logic.
Assessment component demonstrates the user interaction through the assessment. steps 4 - 6.


