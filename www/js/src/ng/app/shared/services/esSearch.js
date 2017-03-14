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

            function doSearch(){
                // support switching of headers for API Tool
                var headers = {
                            'X-Requested-With': 'XMLHttpRequest'
                        };
                if(input.headers){
                    for (var prop in input.headers){
                        headers[prop] = input.headers[prop];
                    }
                }

                // if(!input.type) { input.type = 'object';}
                if(website_env !== 'prod') {
                    console.log('SEARCH INPUT:', input);
                }

                var qsfrom = "";
                if (input.hasOwnProperty('from') && input.from != "0") {
                    qsfrom = "&from=" + input.from;
                }

                var filters = "";
                // This code base splits out the collection facet; capture it here
                /*
                if (input.hasOwnProperty('searchIndex') && input.searchIndex != "" && input.searchIndex != "oc") {
                    var cols = input.searchIndex.split(",");
                    for (var c in cols) {
                        filters += ' "' + cols[c] + '"';
                    }
                }
                */

                var q = encodeURIComponent(searchString.vars.query);

                // Add filters for each facet
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("filter") && input["body"]["filter"] !== "omit" ) {
                    var beginString = "0001-01-01"; // Is this earliest date for which we have research data?
                    var endDate = new Date();
                    var endString = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate();

                    for (var filterField in input["body"]["filter"]) {
                        var filterItem = input["body"]["filter"][filterField];
                        if (filterItem["terms"].length > 0) {
                            var thisFilter = "";
                            for (var t in filterItem["terms"]) {
                                thisFilter += ' "' + encodeURIComponent(filterItem["terms"][t]) + '"';
                            }
                            if (filterField.toLowerCase() == "creator") {
                                filterField = 'http://dublincore.org/documents/dcmi-terms#contributor.author';
                                q = q + " AND " + encodeURIComponent(filterField) + ":" + thisFilter;
                            } else {
                                if (filters != "") { filters += ";"; }
                                filters = encodeURIComponent(filterField) + ":" + thisFilter.trim();
                            }
                        }
                        if (filterItem.hasOwnProperty("begin") && filterItem.hasOwnProperty("end")) {
                            if (filterItem.begin != "") {
                                var beginDate = new Date(parseInt(filterItem.begin.key,10));
                                beginString = beginDate.getFullYear() + "-" + (beginDate.getMonth() + 1) + "-" + beginDate.getDate();
                            }
                            if (filterItem.end != "") {
                                endDate = new Date(parseInt(filterItem.end.key,10));
                                endString = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate();
                            }
                        }
                    }

                    // Always wrap the original (possibly boolean) query with the date
                    // 2017-01-26: Space after the first parens is needed due to Globus search bug
                     q = "( "+ q + ") AND " + encodeURIComponent("http://dublincore.org/documents/dcmi-terms#date")+":[" + beginString + " TO " + endString + "]"
                }

                var facets = "";
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("aggsArr")) {
                    for (var t=0; t <  input["body"]["aggsArr"].length; t++) {
                        if (facets != "") { facets = facets + ","; }
                        var simpleFacet = input["body"]["aggsArr"][t];
                        if (simpleFacet.toLowerCase() == "creator") {
                            facets = facets + 'http://dublincore.org/documents/dcmi-terms#contributor.author';
                        } else if (simpleFacet.toLowerCase() == "sortdate") {
                            facets = facets + 'http://dublincore.org/documents/dcmi-terms#date';
                        } else {
                            facets = facets + simpleFacet;
                        }
                    }
                }

                if (filters != "") {
                    filters = "&filters=" + filters.trim();
                }
                if (facets == "") {
                    facets = "publication";
                }
                var targetURL = search_api+search_api_endpoint+search_api_search_endpoint+'?stats&facets='+encodeURIComponent(facets)+'&q='+q+qsfrom+filters;

                return $http.get(
                    targetURL,
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
                            for (var o in response.data["gmeta"][item]) {
                                if (response.data["gmeta"][item][o].hasOwnProperty("content")) {
                                    resultSet.push(response.data["gmeta"][item][o]["content"]);
                                }
                            }
                        }

                        // Format the Globus search platform response to look like what UBC code expects
                        var aggsObject = {};
                        for (var facetName in response.data["gfacets"]) {
                            // Turn facet names back into common names where needed
                            if (facetName == "http://dublincore.org/documents/dcmi-terms#date") {
                                q = "sortDate";
                            } else if (facetName == 'http://dublincore.org/documents/dcmi-terms#contributor.author') {
                                q = "creator";
                            } else { q = facetName; }
                            aggsObject[q]= {};
                            aggsObject[q].doc_count_error_upper_bound = 0;
                            aggsObject[q].sum_other_doc_count = 0;
                            aggsObject[q].buckets = [];
                            var bn = 0;
                            for (var b in response.data["gfacets"][facetName]) {
                                aggsObject[q].buckets[bn]={};
                                if (q == "sortDate") {
                                    var d = new Date(response.data["gfacets"][facetName][b]["value"]);
                                    if (isNaN(d)) {
                                        aggsObject[q].buckets[bn].key = new Date().getTime();
                                    } else {
                                        aggsObject[q].buckets[bn].key = d.getTime();
                                    }
                                } else {
                                    aggsObject[q].buckets[bn].key = response.data["gfacets"][facetName][b]["value"];
                                }
                                aggsObject[q].buckets[bn].key_as_string = response.data["gfacets"][facetName][b]["value"];
                                aggsObject[q].buckets[bn].doc_count = response.data["gfacets"][facetName][b]["count"];
                                bn++;
                            }
                        }

                        var output = {
                            results: resultSet,
                            count  : response.data["gstats"]["count"],
                            total  : response.data["gstats"]["total"],
                            aggs   : aggsObject
                        };
                        // debugger;
                        if(website_env !== 'prod') {
                            // console.log('search output:', output);
                        }
                        return output;
                    },
                    function (error) {
                        console.trace('ES query error:', error);
                        return error;
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


