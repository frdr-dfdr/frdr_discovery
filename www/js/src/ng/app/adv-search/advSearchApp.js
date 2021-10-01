define(function(require){

    var templatePath = js_base_url + "ng/app/adv-search/templates/";

    // ----- requireJS dependencies ------ //
    var angular = require('angular'),
        ngRoute = require('ngRoute'),
        ngAnimate = require('ngAnimate'),
        colorpicker = require('ngColorPicker'),
        // load services
        dlServices = require('services/searchString'),
        dlServices = require('services/esSearch'),
        dlServices = require('services/collectionData'),
        dlServices = require('services/apifields'),
        dlServices = require('services/fieldService'),
        ngTranslate = require('pascalprecht.translate'),
        uiBootstrap = require('angularBootstrap'),

        dlAnimations = require('animations'),
        dlFilters = require('filters'),
        dlFacets = require('facets');


    var advSearchApp = angular.module('advSearchApp',[
            'ngRoute',
            'ngAnimate',
            'dlServices',
            'dlAnimations',
            'dlFilters',
            'dlFacets',
            'colorpicker.module',
            'pascalprecht.translate',
            'ui.bootstrap',
            // 'angularModalService'   
        ]
        // ['$routeProvider', function($routeProvider){
        //     reloadOnSearch(false);
        // }]
    ).config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {
            'AND': 'AND',
            'ADVSEARCH_HEADER':'Advanced Search',
            'ADVSEARCH_DOCS_TEXT1': 'For help with full search capabilities and syntax please',
            'ADVSEARCH_DOCS_TEXT2': 'see the documentation',
            'ADVSEARCH_DOCS_URL': '/docs/en/searching/',
            'ALL_FIELDS': 'All fields',
            'ALL_SOURCES': 'All sources',
            'ANYALL_ALL': 'all of these words:', 
            'ANYALL_ANY': 'any of these words:', 
            'ANYALL_EXACT': 'this exact phrase:',
            'BOOLEAN':'Boolean',
            'BRANDING_LABEL': branding_label_en,
            'DISCOVERY_CREDIT': 'Discovery based on UBC Open Collections',
            'FIELD': 'Field',
            'FIELD_ADD': 'Add a field',
            'FIELD_REMOVE': 'Remove field',
            'FOOTER_AND': '&',
            'FOOTER_CARL_ABRC': 'Canadian Association of Research Libraries',
            'FOOTER_CARL_ABRC_URL': 'http://www.carl-abrc.ca/',
            'FOOTER_COMPUTE_CANADA': 'Compute Canada',
            'FOOTER_COMPUTE_CANADA_URL': 'https://www.computecanada.ca/',
            'FOOTER_DISCLAIMER': 'Compute Canada and NDRIO respect the privacy of individuals and will only collect, use, and disclose personal information in keeping with information access and privacy law.',
            'FOOTER_PORTAGE_URL': 'https://www.portagenetwork.ca/',
            'FOOTER_NDRIO': "New Digital Research Infrastructure Organization",
            'FOOTER_NDRIO_URL': 'https://engagedri.ca/',
            'IN':'in',
            'ITEM_COUNT': 'Item Count',
            'KEYWORDS': 'Keywords',
            'LIMIT_BY':'Limit by',
            'MAINPAGE_HEADER': 'Research Discovery',
            'MAINPAGE_LOGO_ALT': 'FRDR-DFDR',
            'MAINPAGE_LOGO_LINK': mainpage_logo_link + '?locale=en',
            'MAINPAGE_LOGO_URL': '/discover/img/sitelogo_en.png',
            'MENU_ACCOUNT': 'Account',
            'MENU_ACCOUNT_ADMIN': 'Admin',
            'MENU_ACCOUNT_DEPOSIT': 'Deposit Data',
            'MENU_ACCOUNT_DEPOSIT_URL': '/repo/PublishDashboard',
            'MENU_ACCOUNT_LOGOUT': 'Log Out',
            'MENU_ACCOUNT_LOGOUT_URL': '/repo/logout',
            'MENU_ACCOUNT_PROFILE': 'Profile',
            'MENU_FEEDBACK': 'Contact Us',
            'MENU_FEEDBACK_URL': '/repo/contactus',
            'MENU_HELP': 'Help',
            'MENU_HELP_ABOUT': 'About',
            'MENU_HELP_ABOUT_URL': '/docs/en/about/',  
            'MENU_HELP_DOCUMENTATION': 'Documentation',
            'MENU_HELP_DOCUMENTATION_URL': '/docs/en/', 
            'MENU_HELP_GETACCOUNT': 'Get An Account',
            'MENU_HELP_GETACCOUNT_URL': '/docs/en/before_depositing/',
            'MENU_HELP_SUPPORT': 'Contact Support',
            'MENU_HELP_SUPPORT_URL': '/repo/contactus',
            'MENU_HELP_TERMS': 'Terms of Service',
            'MENU_HELP_TERMS_URL': '/policies/en/terms_of_use/',
            'MENU_HELP_POLICES': 'Policies',
            'MENU_HELP_POLICIES_URL': '/policies/en/',
            'MENU_HELP_VIDEOS': 'Video Tutorials',
            'MENU_HELP_VIDEOS_URL': 'https://www.youtube.com/watch?v=U4Qaia4KZAU&list=PLX9EpizS4A0suoSV2N0nn9parl96xHPkz',
            'MENU_LOCALE': 'EN',
            'NOT': 'NOT',
            'OR': 'OR',
            'PRIVACY_POLICY': 'Privacy Policy',
            'PRIVACY_POLICY_URL': '/policies/en/privacy_policy/',
            'REPOLIST_HEADER':'Canadian Research Data Repositories',
            'REPOLIST_BLURB_1': 'This is the list of research data repositories currently included in the discovery results.  Please',
            'REPOLIST_BLURB_2': 'contact support',
            'REPOLIST_BLURB_3': 'to have a repository added.',
            'REPOLIST_BLURB_URL': '/repo/contactus',
            'REPOLIST_TOTAL_FOOTER': 'Total number of sources',
            'REPOSITORY_NAME': 'Repository Name',
            'SEARCH': 'Search',
            'SOURCE': 'Source',
            'SURVEY_URL': 'https://form.simplesurvey.com/f/s.aspx?s=6bd56233-dfa4-42dc-9a91-a2a63bacf544&lang=EN',
            'SURVEY_TEXT': 'FRDR Full Survey',
            'WEBSITE': 'Website'
        });
             
        $translateProvider.translations('fr', {
            'AND': 'Et',
            'Author': 'Auteur',
            'ADVSEARCH_HEADER':'Recherche avancée',
            'ADVSEARCH_DOCS_TEXT1': 'Pour obtenir de l\'aide sur les fonctions de recherche complètes et la syntaxe, veuillez',
            'ADVSEARCH_DOCS_TEXT2': 'lire la documentation',
            'ADVSEARCH_DOCS_URL': '/docs/fr/recherche/',
            'ALL_FIELDS': 'Tous les champs',
            'ALL_SOURCES': 'Toutes les sources',
            'ANYALL_ALL': 'tous ces mots :',
            'ANYALL_ANY': 'un de ces mots :',
            'ANYALL_EXACT': 'cette expression exacte :',
            'BOOLEAN':'Booléen',
            'BRANDING_LABEL': branding_label_fr,
            'Date (yyyy-mm-dd)': 'Date (aaaa-mm-jj)',
            'DISCOVERY_CREDIT': 'Découverte basé sur UBC Open Collections',
            'FIELD': 'Champ',
            'FIELD_ADD': 'Ajouter un champ',
            'FIELD_REMOVE': 'Supprimer ce champ',
            'FOOTER_AND': 'et',
            'FOOTER_CARL_ABRC': 'Association des bibliothèques de recherche du Canada',
            'FOOTER_CARL_ABRC_URL': 'http://www.carl-abrc.ca/fr/',
            'FOOTER_COMPUTE_CANADA': 'Calcul Canada',
            'FOOTER_COMPUTE_CANADA_URL': 'https://www.computecanada.ca/?lang=fr',
            'FOOTER_DISCLAIMER': 'Calcul Canada et NOIRN respectent la vie privée des personnes et ne collecteront, utiliseront et ne divulgueront les renseignements personnels que dans le respect des lois sur l\'accès à l\'information et la protection de la vie privée.',
            'FOOTER_PORTAGE_URL': 'https://www.portagenetwork.ca/fr/',
            'FOOTER_NDRIO': "Nouvelle organisation d’infrastructure de recherche numérique",
            'FOOTER_NDRIO_URL': 'https://engagedri.ca/fr/',
            'IN':'dans',
            'ITEM_COUNT': 'Nombre d\'éléments',
            'KEYWORDS': 'Mots-clés',
            'Keyword': 'Mots-clés',
            'LIMIT_BY':'Limite par',
            'MAINPAGE_HEADER': 'Découverte de la recherche',
            'MAINPAGE_LOGO_ALT': 'FRDR-DFDR',
            'MAINPAGE_LOGO_LINK': mainpage_logo_link + '?locale=fr',
            'MAINPAGE_LOGO_URL': '/discover/img/sitelogo_fr.png',
            'MENU_ACCOUNT': 'Compte',
            'MENU_ACCOUNT_ADMIN': 'Admin',
            'MENU_ACCOUNT_DEPOSIT': 'Données publiées',
            'MENU_ACCOUNT_DEPOSIT_URL': '/repo/PublishDashboard',
            'MENU_ACCOUNT_LOGOUT': 'Se déconnecter',
            'MENU_ACCOUNT_LOGOUT_URL': '/repo/logout',
            'MENU_ACCOUNT_PROFILE': 'Profil',
            'MENU_FEEDBACK': 'Contactez-nous',
            'MENU_FEEDBACK_URL': '/repo/contactus?locale=fr',
            'MENU_HELP': 'Aider',
            'MENU_HELP_ABOUT': 'À propos de ce site',
            'MENU_HELP_ABOUT_URL': '/docs/fr/à_propos/',
            'MENU_HELP_DOCUMENTATION': 'Documentation',
            'MENU_HELP_DOCUMENTATION_URL': '/docs/fr/',
            'MENU_HELP_GETACCOUNT': 'Obtenez un compte',
            'MENU_HELP_GETACCOUNT_URL': "/docs/fr/avant_de_déposer/",
            'MENU_HELP_SUPPORT': 'Contactez le support',
            'MENU_HELP_SUPPORT_URL': '/repo/contactus?locale=fr',
            'MENU_HELP_TERMS': 'Conditions d\'utilisation',
            'MENU_HELP_TERMS_URL': '/policies/fr/conditions_d%27utilisation/',
            'MENU_HELP_POLICES': 'Politiques',
            'MENU_HELP_POLICIES_URL': '/policies/fr/',
            'MENU_HELP_VIDEOS': 'Tutoriels vidéos',
            'MENU_HELP_VIDEOS_URL': 'https://www.youtube.com/watch?v=U4Qaia4KZAU&list=PLX9EpizS4A0suoSV2N0nn9parl96xHPkz',
            'MENU_LOCALE': 'FR',
            'NOT': 'Sauf',
            'OR': 'Ou',
            'PRIVACY_POLICY': 'Politique de confidentialité',
            'PRIVACY_POLICY_URL': '/policies/fr/conditions_d%27utilisation/',
            'REPOLIST_HEADER':'Dépôts de données de recherche au Canada',
            'REPOLIST_BLURB_1': 'Voici la liste des Dépôts de données de recherche actuellement inclus dans les résultats de la découverte.  Veuillez',
            'REPOLIST_BLURB_2': 'contactez le support',
            'REPOLIST_BLURB_3': 'pour ajouter un référentiel de données.',
            'REPOLIST_BLURB_URL': '/repo/contactus?locale=fr',
            'REPOLIST_TOTAL_FOOTER': 'Nombre total de sources ',
            'REPOSITORY_NAME': 'Nom du dépôt de données',
            'SEARCH': 'Recherche',
            'SOURCE': 'Source',
            'SURVEY_URL': 'https://form.simplesurvey.com/f/s.aspx?s=6bd56233-dfa4-42dc-9a91-a2a63bacf544&lang=FR',
            'SURVEY_TEXT': 'Sondage complet du DFDR',
            'Title': 'Titre',
            'WEBSITE': 'Site Internet'
        });

        $translateProvider.useSanitizeValueStrategy('escape');            
    }]);


    advSearchApp.boot = function(){
        angular.bootstrap(document, ['advSearchApp']);
    };

    // UPDATE TEMPLATE CACHE (tCache service in services.js)
    advSearchApp.run(['tCache', function (tCache) {
        tCache.clearCache();  // clear cache on dev
        tCache.templatePath = templatePath;
        tCache.getTemplates(['search-header.html','search-builder.html','search-footer.html','quicksearch-bar.html','repo-list.html']);
    }]);

    advSearchApp.config(["$interpolateProvider", "$routeProvider", "$locationProvider", function($interpolateProvider, $routeProvider, $locationProvider){
            $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
            $locationProvider.html5Mode({
                enabled:true,
                requireBase: true
            });

            // $routeProvider.reloadOnSearch(false);
        }]
    );


    /************** ADVANCED SEARCH CONTROLLERS *****************/

    advSearchApp.controller('advSearchController', [
        'esSearchString', 
        'esSearchService', 
        '$scope', 
        '$rootScope', 
        '$location',
        '$window',
        '$http', 
        'facetService', 
        'collectionData', 
        '$q', 
        'apifields', 
        'fieldService', 
        'collectionData', 
        'utility', 
        '$translate',
        function(searchString, es, $scope, $rootScope, $location, $window, $http, facetService, collectionData, $q, apifields, fieldService, collectionData, utility, $translate) {

            fieldService.getFields().then(function(){
                init(); // Go!
            });

            // set up initial scope vars and functions
            function init(){
                $scope.rssSortStore = 7;
                $rootScope.facetsLoaded = false;
                // set facets to display as columns
                facetService.columns = true;
                // facetService.orderField = 'key';   // ordering by key does not yield good UI without further work               
                $rootScope.facetsLoaded = false;
                facetService.columns = true; // set facets to display as columns
                facetService.minimized = true; // set default facet state to closed
                facetService.defaultSort = 'key'; // set default facet sort to alphabetical

                // Set the language from the search string
                var locSearch = $location.search();
                $scope.language = locSearch.lang || "en";
                $translate.use($scope.language);

                $scope.loadFacets = function(){
                    // console.log($rootScope.facetsLoaded, $scope.hideFacets);

                    if ($rootScope.facetsLoaded) return;
                    for (var f in facetService.facets) {
                        facetService.facets[f].open = false;
                    }
                    // sort aggregates by term descending
                    // searchString.vars.aggSort = {'_term' : 'asc'};
                    if ($rootScope.facetsLoaded) return;
                    // start facet query
                    facetService.newFacetQuery('*');
                    $scope.facetsLoaded = true;
                };

                // Update language when user clicks language link
                $scope.changeLanguage = function (langKey) {
                    var currentLang = $translate.use();
                    $translate.use(langKey);
                    $scope.language = langKey;
                    if (currentLang != langKey) {
                        updateLocation();
                    }
                };

                // adv search form input ('search segment builder')
                $scope.selectedCollection = {val: "All sources", label: "All sources"};
                $scope.collectionList = [];
                $scope.repoList = [];
                collectionData.getColsData().then(function(response){
                    $scope.collectionList = response.data;
                    $scope.repoList = angular.copy(response.data);
                    $scope.total = $scope.repoList.length;
                    $scope.collectionList.push({ val: "All sources", label: "All sources" });
                    updateTranslations();
                });

                // get searchable fields from apifields service
                var fields = {};
                fieldService.getFields(fieldService.advSearchFields).then(function(response){
                    fields = response;
                    fields.allfields = {
                        label: 'All fields',
                        map: 'all fields'
                    };
                    $scope.querySegments = [
                        {
                            track: querySegmentTracker,
                            keywords: '',
                            fields: {
                                opts: fields,
                                selected: 'all fields'
                            }, anyAll: {
                                opts: [ 'ANYALL_ANY', 'ANYALL_ALL', 'ANYALL_EXACT'],
                                selected: 'ANYALL_ANY'
                            }, bool: {
                                opts: [ 'AND', 'OR', 'NOT'],
                                selected: 'AND'
                            }
                        }
                    ];
                    updateTranslations();
                });

                // UPDATE ON LOCATION CHANGE
                $scope.$on('$locationChangeSuccess', function () {
                    console.log("Location update");
                    if ($location.path().startsWith('/discover/') ) {
                        updateTranslations();
                    } else {
                        $window.location.href = $location.url();
                    }
                });

                var querySegmentTracker = 0;

                $scope.addSegment = function() {
                    querySegmentTracker++;
                    utility.gaEvent('advanced_search', 'add_segment', querySegmentTracker + '_segments');
                    $scope.querySegments.push(
                        {
                        track: querySegmentTracker,
                        keywords: '',
                        fields: {
                            opts: fields,
                            selected: 'all fields'
                        }, anyAll: {
                            opts: [ 'ANYALL_ANY', 'ANYALL_ALL', 'ANYALL_EXACT'],
                            selected: 'ANYALL_ANY'
                        }, bool: {
                            opts: [ 'AND', 'OR', 'NOT'],
                            selected: 'AND'
                        }
                    });
                };


                $scope.rmSegment = function(track) {
                    $scope.querySegments.splice(track,1);
                };

                // catch select events
                $scope.selectEvent = function(action, label){
                    utility.gaEvent('advanced_search', action, label);
                };

                // triggered by facet selections
                // sets vars to pass selections to results page
                var filters = {};

                facetService.changed(function(){
                    filters.all = '';

                    angular.forEach(searchString.vars.filter, function(v, key) {

                        filters[key] = '';
                        // console.log(typeof searchString.vars.filter.begin === 'object');
                        if (key === 'sortDate' && typeof searchString.vars.filter.sortDate.begin === 'object'){
                            // console.log(searchString.vars.filter.sortDate);
                            filters.sortDate = '&dBegin=' + searchString.vars.filter.sortDate.begin.key + '&dEnd=' + searchString.vars.filter.sortDate.end.key;
                            // console.log('DATE', filters)
                        }
                        // all others
                        else if (searchString.vars.filter[key].terms.length === 0){
                            filters[key] =  '&' + key + '=none';
                        } else {
                            angular.forEach(searchString.vars.filter[key].terms, function(v, i){
                                // console.log(key, filters[key]);
                                filters[key] += '&' + key + '=' + encodeURIComponent(v);
                            });
                        }
                        filters.all = filters.all.concat(filters[key]);     
                    });

                    $scope.embed.filterString = JSON.stringify(filters.all);
                });

                $scope.search = function(){
                    var collectionArg = "";
                    if ($scope.selectedCollection.val != "" && $scope.selectedCollection.val != "All sources" ) { 
                        collectionArg = "&Collection=" + encodeURIComponent($scope.selectedCollection.val); 
                    }
                    var langArg = "";
                    if ($scope.language != "en") { langArg = "&lang=" + $scope.language; }
                    var query = "?q=" + encodeURIComponent(makeQueryString(false)) + collectionArg + langArg,
                        limits = filters.all || '',
                        // TODO: update url as appropriate
                        url = '/discover/html/discovery-ui.html';
                    var fullquery = url + query + limits;
                    if ($scope.circleOnly){
                        fullquery += '&circle=y';
                    }
                    utility.gaEvent('advanced_search', 'execute_search');
                    // console.log(fullquery)
                    window.location.href = fullquery;
                };

                // closed state for facets by default
                $scope.hideFacets = true;

                // UPDATE SECTIONS ON SEGMENT CHANGES
                // note: deep watch (with 'true' paremeter) can be resource-intensive
                $scope.$watch('querySegments', function(){
                    // console.log('segment change!');
                    // update display string
                    $scope.displayString = makeQueryString();

                    $scope.updateApiData();
                    //$scope.updateRSSData();
                    $scope.updateWidgetData();

                    var rssSort = $('#rssSort').length == 0 ? 7 : $('#rssSort').val(),
                        query = "?q=" + makeQueryString() + "&sort=" + rssSort,
                        limits = filters.all || '';
                    $scope.rss.queryString = query + limits;

                }, true);

                // update on facet changes
                facetService.changed(function(){
                    $scope.updateApiData();
                    //$scope.updateRSSData();
                    $scope.updateWidgetData();

                    var rssSort = $('#rssSort').length == 0 ? 7 : $('#rssSort').val(),
                        query = "?q=" + makeQueryString() + "&sort=" + rssSort,
                        limits = filters.all || '';
                    $scope.rss.queryString = query + limits;
                });

                $scope.changeRSSSort = function() {
                    var rssSort = $('#rssSort').length == 0 ? 7 : $('#rssSort').val(),
                        query = "?q=" + makeQueryString() + "&sort=" + rssSort,
                        limits = filters.all || '';
                    $scope.rss.queryString = query + limits;
                };

                // loadApi obj false to start
                $scope.apiLoaded = false;
                $scope.loadApi = function(){
                    if(!$scope.apiLoaded){ $scope.apiLoaded = true; }
                    $scope.updateApiData();
                    //$scope.updateRSSData();
                };

                // set API URL
                $scope.apiUrl = "https://oc-index.library.ubc.ca/search?api_key=";


                // load Search Widget
                $scope.widgetLoaded = false;
                $scope.loadWidget = function(){
                    if(!$scope.widgetLoaded){ $scope.widgetLoaded = true; }
                    $scope.updateWidgetData();
                };

                // Embeddable Search Widget Default Data
                $scope.embed = {
                    src: js_base_url + 'embed/search.js',
                    placeholder: "Search the Open Collections",
                    color: '#002145',
                    inline : false,
                    keepQuery: false,
                    queryString: '*'
                };

                $scope.rss = {
                    queryString: '*'
                };

                // set api fields & template from apifields service
                apifields.getFields().then(function(response){
                    $scope.apiFields = response;
                });
                
                $scope.apiFieldsTemplate = apifields.selectTemplate;
                //$scope.updateApiData();
                //$scope.updateRSSData();

            }

            function updateLocation() {
                utility.windowstop();
                var locObj = {
                    'lang': $scope.language
                };
                $location.search(locObj);
            }

            function updateTranslations() {
                $translate('ALL_SOURCES').then(function(t) {
                    $scope.selectedCollection = {val: "All sources", label: t};
                    $scope.collectionList[$scope.collectionList.length-1] = {val: "All sources", label: t};
                });
                $translate('ALL_FIELDS').then(function(t) {
                    for (var qs = 0; qs < $scope.querySegments.length; qs++) {
                        $scope.querySegments[qs].fields.opts.allfields.label = t;
                    }
                });
                $translate('ANYALL_ANY').then(function(t) {
                    for (var qs = 0; qs < $scope.querySegments.length; qs++) {
                        $scope.querySegments[qs].anyAll.opts[0] = t;
                        $scope.querySegments[qs].anyAll.selected = t;
                    }
                });
                $translate('ANYALL_ALL').then(function(t) {
                    for (var qs = 0; qs < $scope.querySegments.length; qs++) {
                        $scope.querySegments[qs].anyAll.opts[1] = t;
                    }
                }); 
                $translate('ANYALL_EXACT').then(function(t) {
                    for (var qs = 0; qs < $scope.querySegments.length; qs++) {
                        $scope.querySegments[qs].anyAll.opts[2] = t;
                    }
                });
            }

             // make query string from segments
            function makeQueryString(opts) {
                var qString = '';
                angular.forEach($scope.querySegments, function(v, key){
                    var bool = '',
                        keywords = '',
                        fields = '',
                        escapes = ['+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':'],
                        re;
                    // keywords = v.keywords || '*';

                    if (v.keywords === '') { keywords = '*'; } else { keywords = v.keywords; }
                    
                    if (key !== 0) {
                        bool = ' ' + v.bool.selected + ' ';
                    }
                    if (v.fields.selected != 'all fields') {
                        fields = v.fields.selected + ': ';
                    }

                    if (v.anyAll.selected === 'this exact phrase:' || v.anyAll.selected === 'cette expression exacte :'){
                        // escape lucene special characters - backslash seperate to prevent crazy loops.
                        if(keywords !== '*'){
                            v.keywords = v.keywords.replace(/\\/g, "\\\\");
                            for (var i = 0, len = escapes.length; i < len; i++){
                                // keywords = keywords.replace(re, '\\' + escapes[i], 'g');  global flag doesn't work in Chrome.
                                keywords = keywords.split(escapes[i]).join('\\' + escapes[i]);
                            }
                        }
                        keywords = '"'+ keywords + '"';
                        // console.log(keywords);
                    }
                    else if (v.anyAll.selected === 'all of these words:' || v.anyAll.selected === 'tous ces mots :') {
                        // get rid of silly quotes.. 
                        keywords = keywords.replace(/"/g,'');
                        keywords = keywords.split(' ').join(' AND ');
                        //if(v.fields.selected != 'all fields'){
                            keywords = '('+ keywords + ')';
                        //}
                    }
                    else {
                        keywords = keywords.replace(/"/g,'');
                        keywords = keywords.split(' ').join(' OR ');
                        keywords = '('+ keywords + ')';
                    }

                    
                    //if(v.fields.selected === 'title combined'){
                    //    qString += bool + '(title:' + keywords + ' OR alternateTitle:' + keywords + ')';  // hack to support combined title searching
                    //} else {
                    //    qString += bool + fields + keywords;
                    //}

                    qString += bool + fields + keywords;
                });


                function getKeywords(keywords, fields) {

                }

                return qString;
            }


            function getSearchString(fields){
                var body;

                if (fields){
                    // if api, use that method
                    return searchString.makeString({
                        query : $scope.displayString,
                        aggsObj: 'omit',
                        scriptFields: 'omit',
                        fields: fields
                    }).then(function(response){
                        // console.log(response);
                        return $q.when(response);
                    });
                } else {
                    // otherwise normal search string method for search widget
                    return searchString.makeString({
                        query : $scope.displayString,
                        scriptFields : 'omit',
                        aggsObj : 'omit',
                    }).then(function(response){
                        // console.log(response);
                        return  $q.when(response);
                    });
                }

            }

            function getQueryObj(body){
                var nicks = elasticsearch_main;

                var obj =  {
                    from : 0,
                    size : 10,
                    body : body,
                    index: nicks,
                    type : 'object'
                };
                
                if (searchString.vars.filter.collection.terms.length > 0) {
                    nicks = searchString.vars.filter.collection.terms;
                    // resolve aggregate collection nicks to full strings with collectionData service, then set index 
                    return collectionData.resolveAggs(nicks).then(function(response){
                        obj.index = response;
                        return $q.when(obj);
                    });   
                } else {
                    // if no collections selected, just return query obj
                    return $q.when(obj);
                }
                
            }

            $scope.updateApiData = function()   {
                if(!$scope.apiLoaded) return;
                 console.log(apifields.getSelected());
                    getSearchString(apifields.getSelected()).then(function(response){
                        // console.log(response);
                        getQueryObj(response).then(function(response2){
                            $scope.apiObj = JSON.stringify(response2, null, 2);

                    }); 
                });
            };

            $scope.updateRSSData = function() {
                var query = "?q=" + makeQueryString(),
                    limits = filters.all || '';

                getSearchString(apifields.getSelected()).then(function(response){
                    getQueryObj(response).then(function(response2){
                        $scope.rss.queryString = encodeURIComponent(JSON.stringify(response2, null, 2));

                    });
                });
            };

            $scope.updateWidgetData = function()  {
                if(!$scope.widgetLoaded) return;
                
                if($scope.embed.keepQuery){
                    $scope.embed.queryString = JSON.stringify($scope.displayString);
                }

                if($scope.embed.inline) {
                    getSearchString(["author","ubc.date.sort","title","ubc.internal.handle","ubc.internal.provenance.nick","ubc.internal.repo","ubc.internal.repo.handle"]).then(function(response){
                        getQueryObj(response).then(function(response2){
                            $scope.embed.queryObj = response2;
                        });
                    });
                } else {
                    $scope.embed.queryObj = {};
                }
                

            };



    }])// END advSearchController


    /************** ADVANCED SEARCH DIRECTIVES *****************/

    .directive('searchHeader', function () {
        return {
            restrict: 'E',
            templateUrl: templatePath + 'search-header.html?version=' + app_version,
        };
    })

    .directive('searchBuilder', function () {
        return {
            restrict: 'E',
            templateUrl: templatePath + 'search-builder.html?version=' + app_version,
        };
    })

    .directive('quicksearchBar', function () {
        return {
            restrict: 'E',
            controller: 'searchController',
            templateUrl: templatePath + 'quicksearch-bar.html?version=' + app_version,
        };
    })

    .directive('repoList', function () {
        return {
            restrict: 'E',
            templateUrl: templatePath + 'repo-list.html?version=' + app_version,
        };
    })

    .directive('searchFooter', function () {
        return {
            restrict: 'E',
            templateUrl: templatePath + 'search-footer.html?version=' + app_version,
        };
    })

    .directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });
     
                    event.preventDefault();
                }
            });
        };
    })

    .directive('advsSection', ["utility", function(utility){
        return{
            restrict: 'A',
            scope: true,
            link: function($scope, element, attrs){
                element.find('.dl-collapse-title').on('click', function(){
                    utility.gaEvent('item_page', 'accordion_section', attrs.advsSection + "_" + String($scope.isOpen));
                });
            }
        };
    }])
    .directive('colorbox', function(){
        return{
            restrict: 'A',
            scope: {
                color: '='
            },         
            link: function($scope, element, attrs){

                var thisColor = rgb2hex(element.css('background-color'));

                element.on('click', function(){
                    $scope.color = thisColor;
                    $scope.$apply();
                    // console.log(thisColor, $scope.color);
                    element.siblings('.dl-colorbox').removeClass('selected');
                    element.addClass('selected');
                });

                $scope.$watch('color', function(){
                    element.removeClass('selected');
                });

                function rgb2hex(rgb){
                 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                 return (rgb && rgb.length === 4) ? "#" +
                  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
                }
               
            }
        };
    }); 

    // END advSearchApp.--

    return advSearchApp;
});
