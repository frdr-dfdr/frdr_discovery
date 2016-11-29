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

                var pagination = "";
                if (input.hasOwnProperty('from') && input.from != "0") {
                    pagination = "&from=" + input.from;
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
                // Add filters for each facet
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("filter") && input["body"]["filter"] !== "omit" ) {
                    for (var filterField in input["body"]["filter"]) {
                        var filterItem = input["body"]["filter"][filterField];
                        if (filterItem["terms"].length > 0) {
                            var thisFilter = "";
                            for (var t in filterItem["terms"]) {
                                thisFilter += ' "' + filterItem["terms"][t] + '"';
                            }
                            if (filters != "") { filters += ";"; }
                            filters = filterField + ":" + thisFilter.trim();
                        }
                    }
                }

                if (filters != "") {
                    filters = "&filters=" + filters.trim();
                }
                console.log("Filters: ",filters);
                
                return $http.get(
                    search_api+search_api_endpoint+search_api_search_endpoint+'?stats&facets=publication&q='+encodeURIComponent(searchString.vars.query)+pagination+filters,
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
                        for (var i in response.data["gfacets"]) {
                            for (var p in response.data["gfacets"][i]) {
                                if (p == "Publication Date") { q = "sortDate"; } else { q = p; }
                                aggsObject[q]= {};
                                aggsObject[q].doc_count_error_upper_bound = 0;
                                aggsObject[q].sum_other_doc_count = 0;
                                aggsObject[q].buckets = [];
                                var bn = 0;
                                for (var b in response.data["gfacets"][i][p]) {
                                    aggsObject[q].buckets[bn]={};
                                    aggsObject[q].buckets[bn].key = response.data["gfacets"][i][p][b]["value"];
                                    aggsObject[q].buckets[bn].key_as_string = response.data["gfacets"][i][p][b]["value"];
                                    aggsObject[q].buckets[bn].doc_count = response.data["gfacets"][i][p][b]["count"];
                                    bn++;
                                }
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


