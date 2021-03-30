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
                 return s.replace(new RegExp('(^|[\\s(]+)(title[\\s]*:[\\s]*)', 'img'), '$1dc_title_multi: ')
                    .replace(new RegExp('(^|[\\s(]+)(author[\\s]*:[\\s]*)', 'img'), '$1dc_contributor_author: ')
                    .replace(new RegExp('(^|[\\s(]+)(date[\\s]*:[\\s]*)', 'img'), '$1dc_date: ')
                    .replace(new RegExp('(^|[\\s(]+)(subject[\\s]*:[\\s]*)', 'img'), '$1frdr_subject_multi: ')
                    .replace(new RegExp('(^|[\\s(]+)(keyword[\\s]*:[\\s]*)', 'img'), '$1frdr_keyword_multi: ')
                    .replace(new RegExp('(^|[\\s(]+)(description[\\s]*:[\\s]*)', 'img'), '$1dc_description_multi: ');
            }

            function globusEscapeURI(s) {
                return s.replace(/([.])/mg, "\\$1");
            }

            function globusUnEscapeURI(s) {
                return s.replace(/\\([.])/mg, "$1");
            }

            function globusEscapeQuerystring(s) {
                return s.replace(/([.\\\/])/mg, "\\$1").replace(/(https*)(:)/mg,'$1\\$2').replace(/'/,"%27");
            }

            function doSearch(){
                // support switching of headers for API Tool
                var postObject = {"@datatype": "GSearchRequest","@version": "2017-09-01","result_format_version": "2017-09-01","advanced": true,"limit": 20};
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
                if (postObject.q == "*") {
                        postObject.advanced = false;
                }

                // The date histogram will need the start and end dates
                var beginString = "0001-01-01"; // Is this earliest date for which we have research data?
                var endDate = new Date();
                var endStringMonth = (endDate.getMonth() + 1)
                var endStringDay = endDate.getDate()
                var endString = endDate.getFullYear() + "-" + (endStringMonth<10?"0":"") + endStringMonth + "-" + (endStringDay<10?"0":"") + endStringDay;

                // Add filters for each facet
                postObject.filters = [];
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("filter") && input["body"]["filter"] !== "omit" ) {
                    for (var filterField in input["body"]["filter"]) {

                        var filterFieldObject = input["body"]["filter"][filterField];
                        if (filterFieldObject["terms"].length > 0) {
                            if (filterField.toLowerCase() == "author" || filterField.toLowerCase() == "contributor_author") {
                                filterField = 'dc_contributor_author';
                            } else if (filterField.toLowerCase() == "sortDate") {
                                filterField = 'dc_date';
                            } else if (filterField.toLowerCase() == "type") {
                                filterField = 'datacite_resourceTypeGeneral';
                            } else if (filterField.toLowerCase() == "collection") {
                                filterField = 'frdr_origin_id';
                            } else if (filterField.toLowerCase() == "subject" ) {
                                filterField = 'frdr_subject_multi';
                            } else if (filterField.toLowerCase() == "keyword" || filterField.toLowerCase() == "keywords") {
                                filterField = 'frdr_keyword_multi';
                            }

                            filterField = globusEscapeURI(filterField);
                            var thisFilter = {"@datatype": "GFilter","@version": "2017-09-01","type": "match_any","field_name": filterField, "values":[]};
                            for (var t in filterFieldObject["terms"]) {
                                thisFilter.values.push(filterFieldObject["terms"][t]);
                            }
                            postObject.filters.push(thisFilter);
                        }

                        // Check for start and end dates
                        if (filterFieldObject.hasOwnProperty("begin") && filterFieldObject.hasOwnProperty("end")) {
                            if (filterFieldObject.begin != "") {
                                var beginDate = new Date(parseInt(filterFieldObject.begin.key,10));
                                beginString = beginDate.getFullYear() + "-01-01"; // Users are supplying years only, so make sure we start in Jan
                            }
                            if (filterFieldObject.end != "") {
                                endDate = new Date(parseInt(filterFieldObject.end.key,10));
                                endString = endDate.getFullYear() + "-12-31";  // Users are supplying years only, so make sure we go to end of year
                            }
                        }
                    }

                    // Always add a date filter, even if it goes from the beginning of time until now
                    var dateFieldName = globusEscapeURI("dc_date");
                    var dateFilterObject = { "@datatype": "GFilter", "@version": "2017-09-01", "type": "range", "field_name": dateFieldName, "values": [{ "from": beginString, "to": endString }] };
                    postObject.filters.push(dateFilterObject);
                }

                postObject.facets = [];
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("aggsArr")) {
                    for (var t=0; t < input["body"]["aggsArr"].length; t++) {
                        var facetName = input["body"]["aggsArr"][t];
                        var facetObject = {"@datatype": "GFacet","@version": "2017-09-01", "size": 10, "type": "terms"};
                        if (facetName.toLowerCase() == "author" || facetName.toLowerCase() == "contributor_author") {
                            facetName = 'dc_contributor_author';
                        } else if (facetName.toLowerCase() == "sortdate") {
                            facetObject = { "@datatype":"GFacet", "@version":"2017-09-01", "type":"date_histogram", "date_interval": "month",
                                "histogram_range": { "low": beginString, "high": endString } };
                            facetName = 'dc_date';
                        } else if (facetName.toLowerCase() == "type") {
                            facetName = 'datacite_resourceTypeGeneral';
                        } else if (facetName.toLowerCase() == "collection") {
                            facetName = 'frdr_origin_id';
                        } else if (facetName.toLowerCase() == "subject") {
                            facetName = 'frdr_subject_multi';
                        } else if (facetName.toLowerCase() == "keyword" || facetName.toLowerCase() == "keywords") {
                            facetName = 'frdr_keyword_multi';
                        }
                        facetObject["field_name"] = globusEscapeURI(facetName);
                        if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("aggSize") && facetName != "dc_date") {
                            facetObject.size = parseInt(input["body"]["aggSize"]);
                        }
                        postObject.facets.push(facetObject);
                    }
                }

                if (postObject.facets.length == 0) {
                    postObject.facets.push({"@datatype": "GFacet","@version": "2017-09-01","size": 10, "type": "terms", "field_name": "publication"});
                }

                postObject.boosts = [];
                function addBoost(field, factor) {
                    postObject.boosts.push({"@datatype": "GBoost","@version": "2017-09-01","field_name": globusEscapeURI(field),"factor": factor});
                }
                addBoost("dc_title_multi",8);
                addBoost("dc_title_en",6);
                addBoost("dc_title_fr",6);
                addBoost("frdr_subject_multi",4);
                addBoost("frdr_subject_en",3);
                addBoost("frdr_subject_fr",3);
                addBoost("dc_description_multi",3);
                addBoost("dc_description_en",2);
                addBoost("dc_description_fr",2);

                postObject.sort = [];
                if (input.hasOwnProperty("body") && input["body"].hasOwnProperty("sort") && input["body"]["sort"]["field"] !== false ) {
                    var sortFieldName = input["body"]["sort"]["field"];
                    var sortOrder = "asc";
                    if (input["body"]["sort"]["order"] == "desc") {
                        sortOrder = "desc";
                    }
                    var sortObject = {"@datatype": "GSort","@version": "2017-09-01", "order": sortOrder};
                    if (sortFieldName.toLowerCase() == "author" || sortFieldName.toLowerCase() == "contributor_author") {
                        sortFieldName = 'dc_contributor_author';
                    } else if (sortFieldName.toLowerCase() == "sortdate") {
                        sortFieldName = 'dc_date';
                    } else if (sortFieldName.toLowerCase() == "title") {
                        sortFieldName = 'dc_title_multi';
                    }
                    sortObject["field_name"] = globusEscapeURI(sortFieldName);
                    postObject.sort.push(sortObject);
                    postObject.boosts = []; // When sorting results, boost values do not matter
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
                        // FRDR changes for Globus Search
                        function strip_tags(input, allowed) {
                            // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
                            allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); 
                            var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
                            var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
                            return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                                return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                            });
                        }
                        
                        function refit_keys(o) {
                            if (Array.isArray(o)) {
                                var returnObject = [];
                                for (var i=0; i<o.length; i++) {
                                    returnObject[i] = refit_keys(o[i]);
                                }
                            } else if (typeof o === "object") {
                                var returnObject, key, destKey, value;
                                returnObject = {};
                                for (key in o) {
                                    if (o.hasOwnProperty(key)) {
                                        destKey = key;
                                        value = o[key];
                                        if (typeof value === "object") {
                                            value = refit_keys(value);
                                        }
                                        returnObject[destKey] = value;
                                    }
                                }
                            } else if (typeof o === "string") {
                                returnObject = strip_tags(o,"<b><br><em><hr><i><p><pre><s><strong><ul><li><dd><dl><dt><ol><sup><blockquote><u>");
                            } else {
                                returnObject = o;
                            }
                            return returnObject;
                        }

                        if (!response.data.hasOwnProperty("gfacets")) { response.data["gfacets"] = ""; }
                        var resultSet = [];
                        for (var item in response.data["gmeta"]) {
                            if (response.data["gmeta"][item].hasOwnProperty("content")) {
                                thisResult = refit_keys(response.data["gmeta"][item]["content"][0]);
                                resultSet.push(thisResult);
                            }
                        }

                        // Format the Globus search platform response to look like what UBC code expects
                        var aggsObject = {};
                        for (var facetNum in response.data["facet_results"]) {
                            var facetName = globusUnEscapeURI(response.data["facet_results"][facetNum]["name"]);
                            console.log("Got facet results for: " + facetName);
                            // Turn facet names back into common names where needed
                            if (facetName == "dc_date") {
                                facetName = "sortDate";
                            } else if (facetName == 'dc_contributor_author') {
                                facetName = "author";
                            } else if (facetName == 'datacite_resourceTypeGeneral') {
                                facetName = "type";
                            } else if (facetName == 'frdr_subject_multi') {
                                facetName = "subject";
                            } else if (facetName == 'frdr_origin_id') {
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


