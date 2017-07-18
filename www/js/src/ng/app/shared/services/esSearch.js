define(function(require){

    var angular = require('angular');
    var services = require('services/services');
    var dlServices = require('services/searchString');
    var dlServices = require('services/collectionData');
    
    services.service('esHost', [ 'esFactory', function (esFactory) {
        return esFactory({
            host: search_api+search_api_endpoint+search_api_search_endpoint+'/search?api_key='+api_key
        });
    } ]);
    // query elasticsearch
    // SEARCH query
    services.factory('esSearchService', [ '$q', '$http', 'esSearchString', 'collectionData',
    function ($q, $http, searchString, collectionData) {
        var s = {};
        s.input = {};
        s.output = {};
        s.search = function (input) {

            // specified searchIndex? if so, change the searchindex
            var nicks;
            if (input.searchIndex) {

                nicks = input.searchIndex;

                if(typeof nicks === 'string'){
                    nicks = [nicks];
                }

                // resolve aggregate collection nicks to full strings with collectionData service, then set index 
                return collectionData.resolveAggs(nicks).then(function(response){
                    // console.log('set index from input.searchIndex', response);
                    input.searchIndex = response;
                    return doSearch();
                });   
            // filtered by collection? if so, change the searchindex
            } else if (searchString.vars.filter.Collection.terms.length > 0) {

                nicks = searchString.vars.filter.Collection.terms;
                // resolve aggregate collection nicks to full strings with collectionData service, then set index 
                return collectionData.resolveAggs(nicks).then(function(response){
                    if(website_env !== 'prod') {
                        console.log('set index from searchString filters', response);
                    }
                
                    input.searchIndex = response;
                    return doSearch();
                });   

            } else {
                // if cIRcle only, dsp index, otherwise main index

                input.searchIndex = (searchString.dspOnly === "y") ? 'dsp' : elasticsearch_main;
                return doSearch();

            }

            function stripAccents(s) {
                var in_chrs   = 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
                out_chrs  = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY',
                chars_rgx = new RegExp('[' + in_chrs + ']', 'g'),
                transl    = {}, i,
                lookup    = function (m) { return transl[m] || m; };

                for (i=0; i<in_chrs.length; i++) {
                    transl[ in_chrs[i] ] = out_chrs[i];
                }

                return s.replace(chars_rgx, lookup);
            };

            function replaceFriendlyTerms(s) {
                return s.replace(new RegExp('([\s]*)(title[\s]*:)', 'img'), '$1http://dublincore.org/documents/dcmi-terms#title:')
                    .replace(new RegExp('([\s]*)(author[\s]*:)', 'img'), '$1http://dublincore.org/documents/dcmi-terms#contributor.author:')
                    .replace(new RegExp('([\s]*)(date[\s]*:)', 'img'), '$1http://dublincore.org/documents/dcmi-terms#date:')
                    .replace(new RegExp('([\s]*)(description[\s]*:)', 'img'), '$1http://dublincore.org/documents/dcmi-terms#description:')
                    .replace(new RegExp('([\s]*)(subject[\s]*:)', 'img'), '$1http://dublincore.org/documents/dcmi-terms#subject:');
            }

            function globusEscapeURI(s) {
                return s.replace(/([.])/mg, "\\$1");
            }

            function globusUnEscapeURI(s) {
                return s.replace(/\\([.])/mg, "$1");
            }

            function globusEscapeQuerystring(s) {
                return s.replace(/([-.+()\\\/])/mg, "\\$1").replace(/(https*)(:)/mg,'$1\\$2');
            }

            function doSearch(){
                // support switching of headers for API Tool
                var postObject = {"@datatype": "GSearchRequest","@version": "2016-11-09","advanced": true,"limit": 20};
                var headers = {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json'
                        };
                if(input.headers){
                    for (var prop in input.headers){
                        headers[prop] = input.headers[prop];
                    }
                }

                if(website_env !== 'prod') {
                    console.log('SEARCH INPUT:', input);
                }

                if (input.hasOwnProperty('from') && input.from != "0") {
                    postObject.offset = parseInt(input.from, 10);
                }

                postObject.q = globusEscapeQuerystring(replaceFriendlyTerms(searchString.vars.query));

                // Add filters for each facet
                postObject.filters = [];
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("filter") && input["body"]["filter"] !== "omit" ) {

                    var beginString = "0001-01-01"; // Is this earliest date for which we have research data?
                    var endDate = new Date();
                    var endString = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate();

                    for (var filterField in input["body"]["filter"]) {

                        var filterFieldObject = input["body"]["filter"][filterField];
                        if (filterFieldObject["terms"].length > 0) {
                            if (filterField.toLowerCase() == "author") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#contributor.author';
                            } else if (filterField.toLowerCase() == "sortDate") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#date';
                            } else if (filterField.toLowerCase() == "type") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#type';
                            } else if (filterField.toLowerCase() == "genre") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#type';
                            } else if (filterField.toLowerCase() == "collection") {
                                filterField = 'https://frdr.ca/schema/1.0#origin.id';
                            } else if (filterField.toLowerCase() == "keywords") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#subject';
                            }

                            filterField = globusEscapeURI(filterField);
                            var thisFilter = {"@datatype": "GFilter","@version": "2016-11-09","type": "match_any","field_name": filterField, "values":[]};
                            for (var t in filterFieldObject["terms"]) {
                                thisFilter.values.push(filterFieldObject["terms"][t]);
                            }
                            postObject.filters.push(thisFilter);
                        }

                        if (filterFieldObject.hasOwnProperty("begin") && filterFieldObject.hasOwnProperty("end")) {
                            if (filterFieldObject.begin != "") {
                                var beginDate = new Date(parseInt(filterFieldObject.begin.key,10));
                                beginString = beginDate.getFullYear() + "-" + (beginDate.getMonth() + 1) + "-" + beginDate.getDate();
                            }
                            if (filterFieldObject.end != "") {
                                endDate = new Date(parseInt(filterFieldObject.end.key,10));
                                endString = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate();
                            }
                        }
                    }

                    // Always add a date filter, even if it goes from the beginning of time until now
                    var dateFieldName = globusEscapeURI("http://dublincore.org/documents/dcmi-terms#date");
                    var dateFilterObject = { "@datatype": "GFilter", "@version": "2016-11-09", "type": "range", "field_name": dateFieldName, "values": [{ "from": beginString, "to": endString }] };
                    postObject.filters.push(dateFilterObject);
                }

                postObject.facets = [];
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("aggsArr")) {
                    for (var t=0; t < input["body"]["aggsArr"].length; t++) {
                        var facetName = input["body"]["aggsArr"][t];
                        var facetObject = {"@datatype": "GFacet","@version": "2016-11-09", "size": 10, "type": "terms"};
                        if (facetName.toLowerCase() == "author") {
                            facetName = 'http://dublincore.org/documents/dcmi-terms#contributor.author';
                        } else if (facetName.toLowerCase() == "sortdate") {
                            facetObject = { "@datatype":"GFacet", "@version":"2016-11-09", "size":10, "type":"date_histogram", "date_interval": "month" };
                            facetName = 'http://dublincore.org/documents/dcmi-terms#date';
                        } else if (facetName.toLowerCase() == "type") {
                            facetName = 'http://dublincore.org/documents/dcmi-terms#type';
                        } else if (facetName.toLowerCase() == "genre") {
                            facetName = 'http://dublincore.org/documents/dcmi-terms#type';
                        } else if (facetName.toLowerCase() == "collection") {
                            facetName = 'https://frdr.ca/schema/1.0#origin.id';
                        } else if (facetName.toLowerCase() == "keywords") {
                            facetName = 'http://dublincore.org/documents/dcmi-terms#subject';
                        }
                        facetObject["field_name"] = globusEscapeURI(facetName);
                        postObject.facets.push(facetObject);
                    }
                }

                if (postObject.facets.length == 0) {
                    postObject.facets.push({"@datatype": "GFacet","@version": "2016-11-09","size": 10, "type": "terms", "field_name": "publication"});
                }
                var targetURL = search_api+search_api_endpoint+search_api_search_endpoint;

                return $http.post(
                    targetURL,
                    postObject,
                    {
                        headers: headers
                    })
                    .then(
                    function (response) {
                        if(website_env !== 'prod') {
                            console.log('response:', response);
                        }

                        // FRDR changes for Globus Search
                        if (!response.data.hasOwnProperty("gfacets")) { response.data["gfacets"] = ""; }
                        var resultSet = [];
                        for (var item in response.data["gmeta"]) {
                            if (response.data["gmeta"][item].hasOwnProperty("content")) {
                                resultSet.push(response.data["gmeta"][item]["content"][0]);
                            }
                        }

                        // Format the Globus search platform response to look like what UBC code expects
                        var aggsObject = {};
                        for (var facetNum in response.data["facet_results"]) {
                            var facetName = globusUnEscapeURI(response.data["facet_results"][facetNum]["name"]);
                            // Turn facet names back into common names where needed
                            if (facetName == "http://dublincore.org/documents/dcmi-terms#date") {
                                facetName = "sortDate";
                            } else if (facetName == 'http://dublincore.org/documents/dcmi-terms#contributor.author') {
                                facetName = "author";
                            } else if (facetName == 'http://dublincore.org/documents/dcmi-terms#type') {
                                facetName = "type";
                            } else if (facetName == 'http://dublincore.org/documents/dcmi-terms#subject') {
                                facetName = "Keywords";
                            } else if (facetName == 'https://frdr.ca/schema/1.0#origin.id') {
                                facetName = "Collection";
                            }
                            aggsObject[facetName]= {};
                            aggsObject[facetName].doc_count_error_upper_bound = 0;
                            aggsObject[facetName].sum_other_doc_count = 0;
                            aggsObject[facetName].buckets = [];
                            var bn = 0;
                            for (var b in response.data["facet_results"][facetNum]["buckets"]) {
                                aggsObject[facetName].buckets[bn]={};
                                if (facetName == "sortDate") {
                                    var d = new Date(response.data["facet_results"][facetNum]["buckets"][b]["value"]);
                                    if (isNaN(d)) {
                                        aggsObject[facetName].buckets[bn].key = new Date().getTime();
                                    } else {
                                        aggsObject[facetName].buckets[bn].key = d.getTime();
                                    }
                                } else {
                                    aggsObject[facetName].buckets[bn].key = response.data["facet_results"][facetNum]["buckets"][b]["value"];
                                }
                                aggsObject[facetName].buckets[bn].key_as_string = response.data["facet_results"][facetNum]["buckets"][b]["value"];
                                aggsObject[facetName].buckets[bn].doc_count = response.data["facet_results"][facetNum]["buckets"][b]["count"];
                                bn++;
                            }
                        }

                        var output = {
                            error  : 0,
                            results: resultSet,
                            count  : response.data["count"],
                            total  : response.data["total"],
                            aggs   : aggsObject
                        };
                        return output;
                    },
                    function (error) {
                        console.trace('ES query error:', error);
                        var output = {
                            error  : 1,
                            results: [],
                            count  : 0,
                            total  : 0,
                            aggs   : {}
                        };
                        return output;
                    });
            }

        };
        // search inside a compound object. use searchString.innerHitsString() to make body.
        s.searchInside = function(body){
            var deferred = $q.defer();
            s.input.searchIndex = s.input.searchIndex || elasticsearch_main;
             $http.post(
                search_api+search_api_endpoint+search_api_search_endpoint+'?api_key='+api_key,
                {   
                    from : 0,
                    size : 100,
                    body : body,
                    index: s.input.searchIndex,
                    type : 'object'
                },
                {   
                    headers: {
                        'Content-Type'    : 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(
                function (response) {
                    if(website_env !== 'prod') {
                        console.log('innerSearchResponse:', response);
                    }
                    var result = response.data.data.data;
                    if(website_env !== 'prod') {
                        console.log('serachInside:', result);
                    }
                    var innerHits = result.hits.hits[0].inner_hits.matched_children.hits;
                    deferred.resolve(innerHits);
                },
                function (reject) {
                    console.log('reject:', reject);
                    deferred.reject(reject);
                });
            return deferred.promise;

        };
        return s;
    } ]);
});


