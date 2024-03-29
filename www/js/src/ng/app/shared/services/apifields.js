// This service stores and creates search fields data for the API and Advanced Search tools

define(function(require){

    var angular = require('angular'),
        services = require('services/services');
        dlServices = require('services/fieldService'); 

    services.factory('apifields', ['fieldService', '$q', function (fieldService, $q) {
        var apifields = {};
        apifields.selectTemplate = js_base_url + "ng/app/shared/templates/apifields.html";        

        var theFields = {};
        var defaultFields = ['author', 'title', 'keyword', 'description'];


        apifields.getFields = function() {
            if (angular.equals(theFields, {})){
                return fieldService.getFields(fieldService.advSearchFields).then(function(response){
                    var output = {};
                    for (var f in response){
                       if(!response[f].map.match(/internal/)){
                           output[f] = response[f];
                           if(defaultFields.indexOf(f) > -1){
                                output[f].selected = true;
                           } else {
                                output[f].selected = false;
                           }
                       }
                    } 
                    theFields = output;
                    return output;
                });   
            } else {
                return $q.when(theFields);
            }
            
        };

        apifields.getSelected = function(mapped){
            var arr = [];
            for (var f in theFields){
                if (theFields[f].selected) {
                    if(mapped === 'mapped'){
                        arr.push(theFields[f].map);
                    } else {
                        arr.push(f);
                    }
                }
            }
            return arr;
        };

        return apifields;
    }]);

});
