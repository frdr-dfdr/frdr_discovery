
// This service functions to map the fields and labels returned from ElasticSearch to the front end.

define(function(require){
    var angular = require('angular'),
        services = require('services/services');
    services.factory('fieldService', ['$http', '$q', function ($http, $q) {
        var fieldService = {};
        fieldService.fields = {};
        fieldService.allFieldsArr = [];

        // Config values for field groups
        var config = {
            facetFields : [
                'sortDate',  // needs special treatment: date hist object
                // 'type',
                // 'genre',
                // 'genre',
                'keyword',
                'subject',
                //'creator',
                'author',
                'Collection', // needs special treatment: field needs to be 'nick'
                //'degree',
                //'campus',
                //'program',
                //'affiliation',
                // 'geographicLocation',
                // 'category',
                // 'language',
                // 'peerReviewStatus',
                // 'personOrCorporation',
                // 'scholarlyLevel',
                // 'series',
                
            ],
            resultsFields : [
                'handle',
                'nick',
                'repo',
                'sortDate',
                //'creator',
                'author',
                'type',
                'Collection',
                'program',
                'degree',
                'campus',
                'affiliation',
                'scholarlyLevel',
                'subject',
                'geographicLocation',
                'genre',
                'title',
                'description',
                'dateAvailable'
            ],
            // advanced search fields should now include all available fields for search.
            advSearchFields : [
                //'genre',
                //'geographicLocation',
                'keyword',
                //'subject',
                //'category',
                //'person',
                //'scholarlyLevel',
                //'affiliation',
                //'degree',
                //'program',
                'description',
                //'type',
                //'collection',
                //'creator',
                'author',
                'date',
                'title',
                //'alternateTitle',
                //'language',
                //'peerReviewStatus',
                //'series',
                //'campus',
                //'fullText',
                //'license',
                //'accessId',
                //'contributor',
                //'publisher',
                //'currentLocation',
                //'format',
                //'rights',
                //'dateAvailable',
                //'dateCreated',
                //'dateIssued',
                //'ubcId',
                //'source',
                //'notes',
                //'translation',
                //'reference',
                //'funder',
                //'personOrCorporation',
                //'rbscLocation',
                //'identifier',
                //'grantFundingAgency',
                //'fileFormat'
            ]
        };

        // initialize field arrays based on config object.
        for (var g in config){
            fieldService[g] = [];
        }

        // get the fields data!
        // promise to retrieve fields
        function makeFieldsObj() {
            if (angular.equals({}, 
                fieldService.fields)){
                return $http({
                        method: 'GET',
                        url: fieldmap_url,
                        cache: true
                    }).success(function(response){
                        // console.log('FIELD MAPPINGS CALL', response);
                        // if fields object is already there, stop parsing and return it.
                        if (!angular.equals({}, fieldService.fields)){ return $q.when(fieldService.fields); }
                        // console.log('field mappings parse')
                        // parse fields data:
                        // make fields mapping objects
                        makeFieldsMap(response.data);
                        // make field key arrays based on config
                        makeFieldArrays(fieldService.fields);
                        // console.log('all fields:', fieldService.fields);
                        return fieldService.fields;  
                    }).error(function(error){
                        console.log('error retrieving field mappings', error);
                        return {};
                    });
            } else {
                return $q.when(fieldService.fields);  
            }
        }
        function makeFieldsMap(input){
            // console.log(input);
            for (var f in input){
                var key = input[f][0].sysmap;
                fieldService.fields[key] = {
                    map: input[f][0].sysmap,
                    label: input[f][0].label
                };
            }
            fieldService.fields.handle = { map: 'ubc.internal.handle' };
            fieldService.fields.nick = { map: 'ubc.internal.provenance.nick' };
            fieldService.fields.repo = { map: 'ubc.internal.repo' };
            fieldService.fields.sortDate = {
                     map: 'Date',
                     label: 'Date'
                };
            fieldService.fields.fullText = {
                     map: 'ubc.transcript', 
                     label: 'Full Text'
                };
            fieldService.fields.Keyword = {
                     map: 'Keyword', 
                     label: 'Keyword'
                };
            fieldService.fields.Collection = {
                     map: 'Collection', 
                     label: 'Collection'
                };
        }
        function makeFieldArrays(input){
            // set specific fields objects
            for (var prop in input){
                fieldService.allFieldsArr.push(prop);
                for (var g in config) {
                    if (config[g].indexOf(prop) !== -1) {
                        fieldService[g].push(prop);
                    }
                }
            }
        }

        // ACCESSIBLE FUNCTIONS
        // return object with subset of fields based on array of keys
        fieldService.getFields = function(inputArr) {
            if(!inputArr){
                return makeFieldsObj();
            } else {
                return makeFieldsObj().then(function(){
                    var outputObj = {};
                    for (var i = 0; i < inputArr.length; i++){
                        if(fieldService.fields[inputArr[i]] && fieldService.fields[inputArr[i]].map){
                            outputObj[inputArr[i]] = fieldService.fields[inputArr[i]];
                        } else {
                            console.log('NO MAPPING FOUND FOR', inputArr[i]);
                        }
                    }
                    return outputObj;
                });
            }
        };
        // takes array of field keys and return returns array of 'map' field values
        fieldService.getMapped = function(inputArr){
            var outputArr = [];
            if(!inputArr){
                return makeFieldsObj().then(function(){
                    for (var prop in fieldService.fields) {
                        outputArr.push(fieldService.fields[prop].map);
                    }
                    return outputArr;
                });
            } else {
                return makeFieldsObj().then(function(){
                    if(inputArr === "omit"){ return []; }
                    for (var i = 0; i < inputArr.length; i++){
                        if(fieldService.fields[inputArr[i]] && fieldService.fields[inputArr[i]].map){
                            outputArr.push(fieldService.fields[inputArr[i]].map);
                        } else {
                            console.log('NO MAPPING FOUND FOR', inputArr[i]);
                            outputArr.push(inputArr[i]);
                        }
                    }
                    return outputArr;
                });
            }
        };
        return fieldService;
    }]);

});
