// Search Results Module

// TICKETS: DL-495, DL-476, DL-477, DL-475, DL-125, DL-467,

define(function (require) {

    var templatePath = js_base_url + "ng/app/results/templates/";

    // ----- requireJS dependencies ------ //
    require('jquery', 'moreless');
    var angular = require('angular'),
        ngRoute = require('ngRoute'),
        ngAnimate = require('ngAnimate'),
        dlFacets = require('facets'),
        dlPagination = require('pagination'),
        dlSavedItems = require('savedItems'),
        dlAnimations = require('animations'),
        dlFilters = require('filters'),
        dlThumbs = require('thumbnails'),
        dlD3charts = require('d3onebar'),
        ngTranslate = require('pascalprecht.translate'),
        uiBootstrap = require('angularBootstrap'),

        dlServices = require('services/fieldService');
        dlServices = require('services/searchString');
        dlServices = require('services/esSearch');
        dlServices = require('services/collectionData');
        dlServices = require('services/responsive');
        dlServices = require('services/highlighter');


    // path to templates for directives

    var resultsApp = angular.module('resultsApp', [
            'ngRoute',
            'ngAnimate',
            // 'ngSanitize',
            'dlServices',
            'dlAnimations',
            'dlFilters',
            'dlFacets',
            'dlD3charts',
            'dlSavedItems',
            'dlPagination',
            'dlThumbs',
            'pascalprecht.translate',
            'ui.bootstrap',
        ],
        ['$locationProvider', function ($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }],
        ['$routeProvider', function ($routeProvider) {
            reloadOnSearch(false);
        }]
    ).config(["$interpolateProvider", function ($interpolateProvider) {
            $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
        }]
    ).config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {
            'ACCESS_NOT_PUBLIC': 'Access to this item may be limited or restricted',
            'AFFILIATION': 'Affiliation',
            'APPLIED': 'applied',
            'BRANDING_LABEL': branding_label_en,
            'CLEAR': 'Clear',
            'DESCRIPTION': 'Description',
            'DETAILS': 'Details',
            'DETAILS_HIDE': '- Hide ',
            'DETAILS_SHOW': '+ Show ',
            'DISCOVERY_CREDIT': 'Discovery based on UBC Open Collections',
            'DRILL_DOWN': 'Drill-down',
            'DRILL_DOWN_DESC': 'Filter terms will be updated each time a filter is added, narrowing to reflect the new results each time.',
            'ERROR_GENERAL': 'There has been an error. Please try a different search.',
            'ERROR_NEED_JAVASCRIPT': 'This site requires JavaScript to function properly. Please enable JavaScript in your browser and try loading the page again.',
            'ERROR_NO_RESULTS': 'This search didn\'t return any matches. You might enter a different query, modify your filters, or try an advanced search.',
            'FACET': 'Facet',
            'FACET_CLEAR_FILTERS': 'Clear all filters',
            'FACET_DESC': 'All filter terms for the current search query will remain visible regardless filters added. Many filters can be added, but conflicting selections may yield no results.',
            'FACET_KEEP_FILTERS': 'Keep filters',
            'FILTER': 'filter',
            'FILTER_APPLY': 'Apply filter',
            'FILTER_RESULTS': 'Filter Results',
            'FOOTER_CARL_ABRC': 'Canadian Association of Research Libraries',
            'FOOTER_CARL_ABRC_URL': 'http://www.carl-abrc.ca/',
            'FOOTER_COMPUTE_CANADA': 'Compute Canada',
            'FOOTER_COMPUTE_CANADA_URL': 'https://www.computecanada.ca/',
            'FOOTER_DISCLAIMER': 'Compute Canada and CARL respect the privacy of individuals and will only collect, use, and disclose personal information in keeping with information access and privacy law.',
            'FOUND': 'found',
            'ITEM_AUTHOR_UNKNOWN': 'Author Unknown',
            'ITEM_DESCRIPTION': 'Description',
            'ITEM_EMBARGOED': '<b>Embargoed</b>: Access by request only.',
            'KEYWORDS': 'Keywords',
            'LOAD_MORE': 'Load More',
            'MAINPAGE_ADVSEARCH_LINK': '/discover/html/adv-search.html?lang=en',
            'MAINPAGE_DESCRIPTION': 'A standalone version of the UBC Library Open Collections search results UI.',
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
            'MENU_FEEDBACK': 'Feedback',
            'MENU_FEEDBACK_URL': 'mailto:support@frdr-dfdr.ca',
            'MENU_HELP': 'Help',
            'MENU_HELP_ABOUT': 'About',
            'MENU_HELP_ABOUT_URL': '/docs/en/about/',  
            'MENU_HELP_DOCUMENTATION': 'Documentation',
            'MENU_HELP_DOCUMENTATION_URL': '/docs/en/', 
            'MENU_HELP_GETACCOUNT': 'Get An Account',
            'MENU_HELP_GETACCOUNT_URL': '/docs/en/before_depositing/#getting-an-account/',
            'MENU_HELP_SUPPORT': 'Contact Support',
            'MENU_HELP_SUPPORT_URL': '/docs/en/contact_support/',
            'MENU_HELP_TERMS': 'Terms of Service',
            'MENU_HELP_TERMS_URL': '/docs/en/terms_of_service/',
            'MENU_LOCALE': 'EN',
            'NO_RESULTS': 'No results found',
            'OF': 'of',
            'OPTIONS': 'Options',
            'PRIVACY_POLICY': 'Privacy Policy',
            'PRIVACY_POLICY_URL': '/docs/en/terms_of_service/',
            'PROGRAM': 'Program',
            'REDIRECTING': 'Redirecting to item...',
            'RESULT': 'result',
            'RESULTS_LOADING': 'Loading page-level results...',
            'RESULTS_ON_PAGES': 'Results on pages',
            'SCHOLARLY LEVEL': 'Scholarly level',
            'SEARCH_ADVANCED': 'Advanced Search',
            'SEARCH_ALL': 'Search all content',
            'SEARCH_LIMITED': 'Search cIRcle only',
            'SEARCH_RESULTS': 'Search Results',
            'SORT_OPTIONS_0': 'Sort by relevance',
            'SORT_OPTIONS_1': 'Sort by title A-Z',
            'SORT_OPTIONS_2': 'Sort by title Z-A',
            'SORT_OPTIONS_3': 'Sort by oldest to newest',
            'SORT_OPTIONS_4': 'Sort by newest to oldest',
            'SUBJECT': 'Subject',
            'TO': 'to',
            'TOGGLE_NAVIGATION': 'Toggle Navigation',
            'VIEW_OPTIONS_0': 'List view',
            'VIEW_OPTIONS_1': 'Detailed view'
        });
             
        $translateProvider.translations('fr', {
            'ACCESS_NOT_PUBLIC': 'L\'accès à cet article peut être limité ou restreint',
            'AFFILIATION': 'Affiliation',
            'APPLIED': 'appliqué',
            'BRANDING_LABEL': branding_label_fr,
            'CLEAR': 'Supprimer',
            'DESCRIPTION': 'Description',
            'DETAILS': 'Détails',
            'DETAILS_HIDE': '- Cacher ',
            'DETAILS_SHOW': '+ Montrer ',
            'DISCOVERY_CREDIT': 'Découverte basé sur UBC Open Collections',
            'DRILL_DOWN': 'Percer',
            'DRILL_DOWN_DESC': 'Filtrer les termes seront mis à jour chaque fois qu\'un filtre est ajouté, se rétrécissant pour refléter les nouveaux résultats à chaque fois.',
            'ERROR_GENERAL': 'Il y a eu une erreur. Veuillez actualiser la page ou utiliser le bouton Précédent pour essayer une nouvelle recherche.',
            'ERROR_NEED_JAVASCRIPT': 'Ce site nécessite JavaScript pour fonctionner correctement. Activez JavaScript dans votre navigateur et essayez de charger la page à nouveau.',
            'ERROR_NO_RESULTS': 'Cette recherche n\'a retourné aucune correspondance. Vous pouvez essayer une nouvelle recherche.',
            'FACET': 'Facette',
            'FACET_CLEAR_FILTERS': 'Supprimer les filtres',
            'FACET_DESC': 'Tous les termes de filtre pour la requête de recherche en cours resteront visibles, indépendamment des filtres ajoutés. De nombreux filtres peuvent être ajoutés, mais les sélections contradictoires peuvent donner aucun résultat.',
            'FACET_KEEP_FILTERS': 'Garder les filtres',
            'FILTER': 'filtre',
            'FILTER_APPLY': 'Appliquer filtre',
            'FILTER_RESULTS': 'Filtrer les résultats',
            'FOOTER_CARL_ABRC': 'Association des bibliothèques de recherche du Canada',
            'FOOTER_CARL_ABRC_URL': 'http://www.carl-abrc.ca/fr/',
            'FOOTER_COMPUTE_CANADA': 'Calcul Canada',
            'FOOTER_COMPUTE_CANADA_URL': 'https://www.computecanada.ca/?lang=fr',
            'FOOTER_DISCLAIMER': 'Calcul Canada et ABRC respectent la vie privée des personnes et ne collecteront, utiliseront et ne divulgueront les renseignements personnels que dans le respect des lois sur l\'accès à l\'information et la protection de la vie privée.',
            'FOOTER_PORTAGE_URL': 'https://www.portagenetwork.ca/fr/',
            'FOUND': 'trouvé',
            'ITEM_AUTHOR_UNKNOWN': 'Auteur Inconnu',
            'ITEM_DESCRIPTION': 'Description',
            'ITEM_EMBARGOED': '<b>Sous embargo</b>: Accès sur demande seulement.',
            'KEYWORDS': 'Mots clés',
            'LOAD_MORE': 'Montre plus',
            'MAINPAGE_ADVSEARCH_LINK': '/discover/html/adv-search.html?lang=fr',
            'MAINPAGE_DESCRIPTION': 'Une version autonome du UBC Library Open Collections résultats de recherche UI.',
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
            'MENU_FEEDBACK': 'Commentaires',
            'MENU_FEEDBACK_URL': 'mailto:support@frdr-dfdr.ca',
            'MENU_HELP': 'Aider',
            'MENU_HELP_ABOUT': 'À propos',
            'MENU_HELP_ABOUT_URL': '/docs/fr/a_propos/',  
            'MENU_HELP_DOCUMENTATION': 'Documentation',
            'MENU_HELP_DOCUMENTATION_URL': '/docs/fr/',            
            'MENU_HELP_GETACCOUNT': 'Obtenez un compte',
            'MENU_HELP_GETACCOUNT_URL': "/docs/fr/avant_d'utiliser/#obtenir-un-compte/",
            'MENU_HELP_SUPPORT': 'Contactez le support',
            'MENU_HELP_SUPPORT_URL': '/docs/fr/contactez_nous/',
            'MENU_HELP_TERMS': 'Conditions d\'utilisation',
            'MENU_HELP_TERMS_URL': '/docs/fr/conditions_d%27utilisation/',
            'MENU_LOCALE': 'FR',
            'NO_RESULTS': 'Aucun résultat trouvé',
            'OF': 'de',
            'OPTIONS': 'Options',
            'PRIVACY_POLICY': 'politique de confidentialité',
            'PRIVACY_POLICY_URL': '/docs/fr/conditions_d%27utilisation/',
            'PROGRAM': 'Programme',
            'REDIRECTING': 'Redirection vers l\'article...',
            'RESULT': 'résultat',
            'RESULTS_LOADING': 'Chargement des résultats de la page...',
            'RESULTS_ON_PAGES': 'Résultats sur les pages',
            'SCHOLARLY LEVEL': 'Niveau scolaire',
            'SEARCH_ADVANCED': 'Recherche avancée',
            'SEARCH_ALL': 'Rechercher tout le contenu',
            'SEARCH_LIMITED': 'Recherche cIRcle seulement',
            'SEARCH_RESULTS': 'Résultats de la recherche',
            'SORT_OPTIONS_0': 'Trier par pertinence',
            'SORT_OPTIONS_1': 'Trier par titre A-Z',
            'SORT_OPTIONS_2': 'Trier par titre Z-A',
            'SORT_OPTIONS_3': 'Trier par plus vieux à nouveau',
            'SORT_OPTIONS_4': 'Trier par plus nouveau à vieux',
            'SUBJECT': 'Sujet',
            'TO': 'à',
            'TOGGLE_NAVIGATION': 'Changer la navigation',
            'VIEW_OPTIONS_0': 'Vue liste',
            'VIEW_OPTIONS_1': 'Vue détaillée'
        });

        $translateProvider.useSanitizeValueStrategy('escape');            
    }]);

    resultsApp.boot = function () {
        angular.bootstrap(document, ['resultsApp']);
    };

    // UPDATE TEMPLATE CACHE (tCache service in services.js)
    resultsApp.run(['tCache', function (tCache) {
        tCache.clearCache();  // clear cache on dev
        tCache.templatePath = templatePath;
        tCache.getTemplates(['results-parent.html', 'results-list.html', 'inner-results.html','mainpage-header.html','mainpage-footer.html','mainpage-search-options.html','mainpage-results-header.html']);
    }]);


    // SEARCH CONTROLLER
    // search functionality and routing
    //*******************************************************//
    resultsApp.controller('searchController',
        ['esSearchString',
            'esSearchService',
            '$scope',
            '$rootScope',
            '$location',
            '$window',
            'rExport',
            '$timeout',
            '$filter',
            'pageService',
            'collectionData',
            'max400',
            'highlighter',
            'facetService',
            'fieldService',
            'utility',
            '$translate',
            function (searchString, es, $scope, $rootScope, $location, $window, rExport, $timeout, $filter, pVars, collectionData, max400, highlighter, facetService, fieldService, utility,$translate) {
                $scope.rUpdating = true;
                // make sure fields mappings are loaded FIRST
                fieldService.getFields().then(function () {
                    // Go!
                    init();
                }, function (error) {
                    $scope.searchError = 'error';
                });

                var lucky = false;

                // Setup scoped stuff

                function init() {
                    // pre-load collections data (makes page load much faster)
                    collectionData.aggsSubsCols();
                    $scope.collectionList = [];
                    collectionData.getColsData().then(function(response){
                            $scope.collectionList = response.data;
                    });

                    // SET INITIAL VARS
                    $scope.total = undefined;
                    $scope.noTerms = false;
                    $scope.placeholder = 'Search for something!';
                    $scope.esr = {};
                    $scope.filterCount = searchString.filterCount;
                    $scope.pageRange = [0];

                    //view options
                    $scope.rViewOptions = [
                        {"index": 0, "label": "List view",      "perPage": 20}, 
                        {"index": 1, "label": "Detailed view",  "perPage": 20}, 
                        /* {"index": 2, "label": "Thumbnail view", "perPage": 60}, */
                    ];

                    //sort options
                    $scope.rSortOptions = [
                        {"index": 0, "label": "Sort by relevance",        "field": false,      "order": "desc" }, 
                        {"index": 1, "label": "sort by title A-Z",        "field": "title",    "order": "asc" }, 
                        {"index": 2, "label": "Sort by title Z-A",        "field": "title",    "order": "desc" }, 
                        {"index": 3, "label": "Sort by oldest to newest", "field": "sortDate", "order": "asc"  }, 
                        {"index": 4, "label": "Sort by newest to oldest", "field": "sortDate", "order": "desc" },
                    ];

                    // UPDATE SEARCH BASED ON INITIAL VARS TO START APP
                    //*******************************************************//
                    // all new searches are triggered by changing url location

                    // INITIALIZE
                    getLocation(updateSearch);
                    // UPDATE ON LOCATION CHANGE
                    $scope.$on('$locationChangeSuccess', function () {
                        if ($location.path().startsWith('/discover/') ) {
                            getLocation(updateSearch);
                        } else {
                            $window.location.href = $location.url();
                        }
                    });

                    // INITIALIZE SCOPE FUNCTIONS
                    //*******************************************************//
                    //SEARCH FUNCTIONS
                    $scope.newSearch = function newSearch() {
                        $scope.q = $scope.terms;
                        if(website_env !== 'prod') {
                            console.log('NEW SEARCH', 'keep filters:', searchString.keepFilters);
                        }
                        // reset page number
                        $scope.currentPage = 0;
                        $scope.hidePages = true;
                        // keep filters?
                        if (searchString.keepFilters === false) {
                            facetService.clearFiltersNow();
                            updateLocation();
                        } else {
                            updateLocation();
                        }
                    };

                    $scope.updateSearch = function updateSearch(category) {
                        // catch GA interactions
                        if (category) {
                            if (category === 'sort') {
                                utility.gaEvent('search_results', 'sort_change', $scope.rSort.label);
                            } else if (category === 'view') {
                                utility.gaEvent('search_results', 'view_change', $scope.resultsView.label);
                            }
                        }
                        // update URL string
                        updateLocation();
                    };

                    $scope.modifySearch = function modifySearch() {
                        $scope.currentPage = 0;
                        updateLocation();
                    };

                    // modify search on facet
                    facetService.changed($scope.modifySearch);

                    // Update language when user clicks language link
                    $scope.changeLanguage = function (langKey) {
                        var currentLang = $translate.use();
                        $translate.use(langKey);
                        $scope.language = langKey;
                        if (currentLang != langKey) {
                            updateLocation();
                        }
                    };

                    // update facets & searchString on switch between cIRcle / all content
                    $scope.dspChange = function () {
                        utility.gaEvent('search_results', 'circle_only_radio', $scope.dspOnly);
                        searchString.dspOnly = $scope.dspOnly;
                        facetService.clearFiltersNow();
                        $scope.modifySearch();
                    };

                    // update search on pagination change
                    // uses jQuery .. make sure it's loaded
                    pVars.changed(function () {
                        $scope.currentPage = pVars.currentPage;
                        updateLocation();
                        try {
                            if ($(window).scrollTop() > 800) {
                                $(window).scrollTop(0);
                            }
                        } catch (e) {
                            console.error(e, 'probably no jquery');
                        }
                    });

                    // Filter Actions
                    $scope.clearAllFilters = function () {
                        facetService.clearFiltersNow();
                        $scope.modifySearch();
                    };
                    $scope.addFilter = function (f, t) {
                        utility.gaEvent('search_results', 'add_filter', f);
                        var term = $filter('stripHtmlTags')(t);
                        var index = searchString.vars.filter[f].terms.indexOf(term);
                        if (index === -1) {
                            searchString.vars.filter[f].terms.push(term);
                        }
                        $scope.modifySearch();
                        // if $apply did not already get called, do it (needed for passUp from d3 directives)
                        if (!$scope.$$phase) $scope.$apply();
                    };

                    // pass data from child directives (d3 clicks)
                    $scope.passUp = function (obj) {
                        if (obj.act !== 'filter') {
                            return;
                        }
                        $scope.addFilter(obj.key, obj.term);

                    };

                    // responsive listener for small screens
                    // this is used in the results list to prevent thumbnails from loading when they aren't visible.
                    max400.watch();
                    max400.ismatch(function () {
                        $scope.max400 = true;
                    });
                    max400.notmatch(function () {
                        $scope.max400 = false;
                    });
                }  //-- end init();

                // APP FUNCTIONS
                //*******************************************************//
                // track number of search updates to make sure facets fire on pageload
                var searchCounter = 0;
                // var fireFacets = true;
                // Search elasticSearch / send new search parameters to search services
                function updateSearch(callback) {
                    //update filter count
                    searchString.updateCount();
                    $scope.filterCount = searchString.filterCount;
                    if(facetService.fBehavior === 'expand') {
                        searchString.filterExecution = 'or';
                    } else {
                        searchString.filterExecution = 'and';
                    }
                    // should facets fire?
                    if (searchCounter === 0 || $scope.q !== searchString.vars.query) {
                        $rootScope.facetsLoaded = false;
                    } else {
                        $rootScope.facetsLoaded = true;
                    }
                    $scope.searchError = false;
                    $scope.rUpdating = true;

                    //update search string
                    searchString.vars.query = $scope.q;
                    searchString.vars.lang = $scope.language;
                    searchString.vars.sort = {field: $scope.rSort.field, order: $scope.rSort.order};
                    searchString.dspOnly = $scope.dspOnly;

                    //update search box
                    $scope.terms = $scope.terms || $scope.q;

                    // update page vars
                    pVars.perPage = $scope.resultsView.perPage;
                    pVars.update();

                    //update highlighting terms
                    highlighter.getTerms();

                    if (website_env !== 'prod') {
                        console.log("searchString", searchString);
                    }

                    //define search input, THEN do search
                    // remove string option when stringify can be removed.
                    searchString.makeString().then(function (response) {
                        var searchInput = {
                            from: pVars.from || 0,
                            size: pVars.perPage,
                            body: response
                        };
                        es.search(searchInput).then(function (response) {
                            if (response.error) {
                                $scope.rUpdating = false;
                                $scope.searchError = 'error';
                                $scope.total = 0;
                                $scope.esr = {};
                            } else {
                                searchCounter++;
                                $scope.rUpdating = false;
                                // fire facet queries
                                facetService.newFacetQuery($scope.q);
                                // typedata for onebar used at top of search results
                                $scope.typeData = "";
                                // update results
                                $scope.esr = {
                                    results: response.results
                                };
                                $scope.total = response.total;
                                $scope.hidePages = false;
                                if (!$scope.terms) {
                                    $scope.terms = $scope.q || $scope.placeholder;
                                }
                                // update pagination vars
                                if (pVars.total != $scope.total) {
                                    pVars.total = $scope.total;
                                }
                            }
                        }, function (error) {
                            $scope.rUpdating = false;
                            $scope.searchError = error;
                            $scope.total = 0;
                            $scope.esr = {};
                        });
                    });

                    typeof callback == 'function' && callback();

                }            

                // update URL
                function updateLocation(callback) {
                    utility.windowstop();
                    // get dates from obj
                    var beginKey = '', endKey = '';
                    if (searchString.vars.filter.sortDate.begin && searchString.vars.filter.sortDate.end) {
                        beginKey = searchString.vars.filter.sortDate.begin.key;
                        endKey = searchString.vars.filter.sortDate.end.key;
                    }

                    var locObj = {
                        'q': encodeURIComponent($scope.q),
                        'p': $scope.currentPage,
                        'sort': $scope.rSort.index,
                        'view': $scope.resultsView.index,
                        //'circle': $scope.dspOnly,
                        'lang': $scope.language,

                        'dBegin': beginKey,
                        'dEnd': endKey,

                        // add searchcounter to trigger new searches on same query string
                        'c': searchCounter
                    };

                    // add filters
                    for (var f in searchString.vars.filter) {
                        if (f !== 'sortDate' && searchString.vars.filter[f].terms) {
                            locObj[f] = searchString.vars.filter[f].terms;
                        }
                    }
                    $location.search(locObj);
                    // log as pageview in GA
                    // note: this starts as of Apr 2016, previous analytics will be skewed light on searches
                    utility.gaPageview($location.url());
                    typeof callback == 'function' && callback();
                }

                // get URL string data
                function getLocation(callback) {
                    var locSearch = $location.search();
                    // get current page
                    $scope.currentPage = Number(locSearch.p) || 0;
                    pVars.currentPage = Number(locSearch.p) || 0;
                    // get view
                    $scope.resultsView = $scope.rViewOptions[Number(locSearch.view) || 0];
                    $scope.rSort = $scope.rSortOptions[Number(locSearch.sort) || 0];
                    // get search type
                    $scope.dspOnly = locSearch.circle || "n";
                    // make scope.q natural string so that ES doesn't get thrown off by plusses
                    // $scope.q = searchString.makeNaturalStr(locSearch.q) || '*';
                    $scope.q = decodeURIComponent(locSearch.q) || '*';
                    $scope.q = $scope.q.replace(/:([^ ^\/])/,": $1"); // Ensure colons always have space after them
                    //get query
                    $scope.terms = $scope.q;
                    //get language
                    $scope.language = locSearch.lang || "en";
                    $translate.use($scope.language);
                    // Setup RSS LINK
                    $scope.rssLink = website_base_url + "/rss/search/rss.xml?q=" + encodeURIComponent($scope.q) + "&sort=" + $scope.rSort.index + "&circle=" + $scope.dspOnly;
                    // get filters
                    angular.forEach(searchString.vars.filter, function (v, key) {
                        // var decodedKey = decodeURIComponent(key);
                        searchString.vars.filter[key].terms = getLocFilters(key);
                        if (searchString.vars.filter[key].terms.length > 0) {
                            $scope.rssLink = $scope.rssLink + "&" + key + "=" + encodeURIComponent(searchString.vars.filter[key].terms.join('~@~'));
                        }
                    });
                    // is this initiated by a search widget? log it.
                    if (locSearch.widgetquery) {
                        utility.gaEvent('search_results', 'widget_query', locSearch.widgetquery);
                    }
                    // get date begin/end
                    if (locSearch.dBegin && locSearch.dEnd) {
                        searchString.vars.filter.sortDate.begin = {
                            key: locSearch.dBegin,
                            display: $filter('date')(locSearch.dBegin, 'yyyy')
                        };
                        searchString.vars.filter.sortDate.end = {
                            key: locSearch.dEnd,
                            display: $filter('date')(locSearch.dEnd, 'yyyy')
                        };
                        $scope.rssLink = $scope.rssLink + '&dBegin=' + locSearch.dBegin + '&dEnd=' + locSearch.dEnd;
                    }

                    $translate('VIEW_OPTIONS_0').then(function(t) { $scope.rViewOptions[0]['label'] = t; })
                    $translate('VIEW_OPTIONS_1').then(function(t) { $scope.rViewOptions[1]['label'] = t; })

                    $translate('SORT_OPTIONS_0').then(function(t) { $scope.rSortOptions[0]['label'] = t; })
                    $translate('SORT_OPTIONS_1').then(function(t) { $scope.rSortOptions[1]['label'] = t; })
                    $translate('SORT_OPTIONS_2').then(function(t) { $scope.rSortOptions[2]['label'] = t; })
                    $translate('SORT_OPTIONS_3').then(function(t) { $scope.rSortOptions[3]['label'] = t; })
                    $translate('SORT_OPTIONS_4').then(function(t) { $scope.rSortOptions[4]['label'] = t; })

                    function getLocFilters(loc) {
                        var output = [];
                        var input = locSearch[loc];
                        if (input === undefined || input === 'none' || input.length < 1) {
                            // console.log('locfilters no iput');
                            return [];
                        } else {
                            if (input instanceof Array) {
                                for (var i = 0; i < input.length; i++) {
                                    output.push(decodeURIComponent(input[i]));
                                }
                            } else {
                                output.push(decodeURIComponent(input));
                            }
                            // console.log('locfilters ouput!', output);
                            return output;
                        }
                    }

                    typeof callback == 'function' && callback();
                }
            }
        ])

    // RESULTS CONTROLLER
    // child scope & view for each search result
    //*******************************************************//
        .controller('resultController', [
            '$scope',
            'esSearchString',
            'rExport',
            'collectionData',
            '$http',
            '$filter',
            'highlighter',
            'fieldService',
            'utility',
            function ($scope,
                      searchString,
                      rExport,
                      collectionData,
                      $http,
                      $filter,
                      highlighter,
                      fieldService,
                      utility) {

                var query = searchString.vars.query;
                $scope.base_url = website_base_url;

                // detailed view
                if ($scope.resultsView.index === 1) {
                    $scope.detailView = true;
                    $scope.details = true;
                }

                // get field mappings from fieldservice (promise)
                fieldService.getFields(fieldService.resultsFields).then(function (response) {
                    setR(response);
                });

                function setR(rFields) {

                    var hasFields = function () {
                        var arr = [];
                        for (var prop in $scope.r) {
                            for (var p in rFields) {
                                if (rFields[p].map === prop) {
                                    arr.push(p);
                                }
                            }
                        }
                        return arr;
                    }();

                    // set required / special field vals
                    $scope.r._id = $scope.r.item_url;
                    $scope.r.author = highlighter.highlight(singleVal($scope.r.dc_contributor_author));
                    delete $scope.r.dc_contributor_author;
                    delete $scope.r.dc_contributor;
                    $scope.r.collection = $scope.r['frdr_origin_id'];
                    if ($scope.r.hasOwnProperty("dc_description_fr")) {
                        $scope.r.description_fr = highlighter.highlight(singleVal($scope.r.dc_description_fr));
                        $scope.r.description = $scope.r.description_fr;
                    }
                    delete $scope.r.dc_description_fr;
                    if ($scope.r.hasOwnProperty("dc_description_en") && $scope.r.dc_description_en != "" && $scope.r.dc_description_en != " ") {
                        // EN description, if not blank, will overwrite FR description
                        $scope.r.description_en = highlighter.highlight(singleVal($scope.r.dc_description_en));
                        $scope.r.description = $scope.r.description_en;
                    }
                    delete $scope.r.dc_description_en;
                    if ($scope.r.hasOwnProperty("frdr_category_fr")) {
                        $scope.r.subject_fr = highlighter.highlight(singleVal($scope.r.frdr_category_fr));
                    }
                    delete $scope.r.frdr_category_fr;
                    if ($scope.r.hasOwnProperty("frdr_category_en")) {
                        $scope.r.subject_en = highlighter.highlight(singleVal($scope.r.frdr_category_en));
                    }
                    delete $scope.r.frdr_category_en;
                    $scope.r.detail = {};
                    if ($scope.r.hasOwnProperty("frdr_geospatial")) {
                        $scope.r.geospatial = JSON.stringify($scope.r.frdr_geospatial);
                    }
                    delete $scope.r.frdr_geospatial;
                    if ($scope.r.hasOwnProperty("frdr_keyword_en")) {
                        var jk = JSON.stringify($scope.r.frdr_keyword_en);
                        $scope.r.keyword_en = highlighter.highlight(singleVal(jk.replace(/[\[\]\{\}]/g,"")));
                    }
                    delete $scope.r.frdr_keyword_en;
                    if ($scope.r.hasOwnProperty("frdr_keyword_fr")) {
                        var jk = JSON.stringify($scope.r.frdr_keyword_fr);
                        $scope.r.keyword_fr = highlighter.highlight(singleVal(jk.replace(/[\[\]\{\}]/g,"")));
                    }
                    delete $scope.r.frdr_keyword_fr;
                    if ($scope.r.hasOwnProperty("frdr_access")) {
                        $scope.r.access = $scope.r.frdr_access;
                    } else {
                        $scope.r.access = "";
                    }
                    delete $scope.r.frdr_access;
                    delete $scope.r.frdr_contact;
                    if ($scope.r.hasOwnProperty("datacite_creatorAffiliation")) {
                        $scope.r.author_affiliation = $scope.r.datacite_creatorAffiliation;
                    } else {
                        $scope.r.author_affiliation = "";
                    }
                    delete $scope.r.datacite_creatorAffiliation;
                    $scope.r.publisher = $scope.r.dc_publisher;
                    delete $scope.r.dc_publisher;
                    $scope.r.handle = $scope.r.item_url;
                    if ($scope.r.hasOwnProperty("dc_rights")) {
                        $scope.r.rights = $scope.r.dc_rights;
                    }
                    delete $scope.r.dc_rights;
                    if ($scope.r.hasOwnProperty("frdr_series")) {
                        $scope.r.series = highlighter.highlight(singleVal($scope.r.frdr_series));
                    }
                    delete $scope.r.frdr_series;
                    $scope.r.icon_url = $scope.r['frdr_origin_icon'];
                    $scope.r.nick = $scope.r.collection;
                    $scope.r.repo = $scope.r.collection;
                    $scope.r.saved = rExport.isSaved($scope.r._id);
                    if ($scope.r.hasOwnProperty("dc_title_fr")) {
                        $scope.r.title = highlighter.highlight(singleVal($scope.r.dc_title_fr));
                        $scope.r.title_fr = $scope.r.title;
                    }
                    delete $scope.r.dc_title_fr;
                    if ($scope.r.hasOwnProperty("dc_title_en") && $scope.r.dc_title_en != "" && $scope.r.dc_title_en != " ") {  // EN title will overwrite FR title
                        $scope.r.title = highlighter.highlight(singleVal($scope.r.dc_title_en));
                        $scope.r.title_en = $scope.r.title;
                    } else {
                        $scope.r.title_en = highlighter.highlight(singleVal($scope.r.dc_title_en));
                    }
                    delete $scope.r.dc_title_en;
                    $scope.r.sortDate = highlighter.highlight(singleVal($scope.r.dc_date));
                    delete $scope.r.dc_date;
                    $scope.r.type = singleVal($scope.r.datacite_resourceTypeGeneral);
                    delete $scope.r.datacite_resourceTypeGeneral;

                    // Check for icon overrides in the collection definitions
                    $scope.r.repo_url = "";
                    for (var i=0; i < $scope.collectionList.length; i++) {
                        if ($scope.r.collection == $scope.collectionList[i].val ) {
                            if ($scope.collectionList[i].hasOwnProperty("icon_url") && $scope.collectionList[i].icon_url != "") {
                                $scope.r.icon_url = $scope.collectionList[i].icon_url;
                            }
                            if ($scope.collectionList[i].hasOwnProperty("repo_url")) {
                                $scope.r.repo_url = $scope.collectionList[i].repo_url;
                            }
                        }
                    }

                    // add detail view for ALL fields, only if details visible
                    // we are hiding specific fields so that all unknown fields will be exposed by default
                    var detailsParsed = false;
                    var fieldsToHide = { 
                        "_id":1,"frdr_origin_icon":1,"frdr_origin_id":1,"saved":1,"detail":1,"repo_url":1,"datacite_resourceTypeGeneral":1,
                        "icon_url":1,"frdr_origin_id": 1,"handle":1,"title":1,"description":1, "source_url": 1,
                        "contact": 1,"nick": 1,"collectionLink":1,"rssLink":1,"itemLink":1
                    }
                    function makeArray(o){ if (!angular.isArray(o)) { return [o]; } else { return o;}  }
                    function parseDetails() {
                        for (var key in $scope.r) {
                            if ($scope.r.hasOwnProperty(key) && !fieldsToHide.hasOwnProperty(key)) {
                                if (rFields.hasOwnProperty(key)) {
                                    $scope.r.detail[key] = {
                                        field: key,
                                        label: rFields[key].label,
                                        val: makeArray($scope.r[rFields[key].map]),
                                        facetField: facetable(key)
                                    }
                                } else {
                                    $scope.r.detail[key] = {
                                        field: key,
                                        label: key,
                                        val: makeArray($scope.r[key]),
                                        facetField: facetable(key)
                                    }
                                }
                            }
                        }
                        detailsParsed = true;
                    }

                    if ($scope.details) {
                        parseDetails();
                    }

                    // toggle detailed list view
                    $scope.toggleDetails = function () {
                        if ($scope.details) {
                            $scope.details = false;
                        } else {
                            if (!detailsParsed) {
                                parseDetails();
                            }
                            if (!$scope.innerContent) {
                                getInnerResults();
                            }
                            $scope.details = true;
                        }
                    };

                    //check if field is facetable
                    function facetable(check) {
                        return fieldService.facetFields.indexOf(check) !== -1 ? true : false;
                    }

                    // make sure single val exists for required fields
                    function singleVal(check) {
                        if (check) {
                            return check;
                        } else {
                            return " ";
                        }
                    }

                    // check if embargoed
                    function checkEmbargo(input) {
                        if (!input) return false;
                        var today = new Date(), eDate = new Date(input);
                        // console.log('input:', input, 'eDate:', eDate, 'today:', today);
                        return ((eDate >= today) ? true : false);
                    }

                    // get correct collection data and hyperlinks
                    collectionData.getTitle($scope.r.nick).then(function (response) {
                        // set collection name
                        var nick = (response && response.nick) ? response.nick : $scope.r.nick;
                        // set item link
                        if ($scope.r.nick != nick) {
                            $scope.r.itemLink = 'collections/' + nick + '/' + $scope.r.nick + '/items/' + $scope.r._id;
                        }
                        else if ($scope.r.repo == 'dsp') {
                            $scope.r.itemLink = 'cIRcle/collections/' + nick + '/items/' + $scope.r._id;
                        }
                        else {
                            $scope.r.itemLink = 'collections/' + nick + '/items/' + $scope.r._id;
                        }
                        // if compound object, add search query string to url for viewer
                        if ($scope.r.compound) {
                            $scope.r.itemLink = $scope.r.itemLink.concat('#p0z-10000r0f:' + encodeURIComponent(searchString.vars.query));
                        }
                        // set collection link
                        $scope.r.collectionLink = 'collections/' + nick;
                    });

                    // load page level results for compound objects (if showing details)
                    if ($scope.r.compound && $scope.details) {
                        getInnerResults();
                    }
                    function getInnerResults() {
                        // if empty query, then set compound to false because in-text searching is useless (hides the whole thing)
                        //if (query === '*') {
                            $scope.r.compound = false;
                            return;
                        //}

                        var dashedId = $scope.r._id.replace(/\./g, "-");
                        var newHandle = $scope.r.repo + "." + $scope.r.nick + "." + dashedId;
                        // otherwise do in text search:
                        // var iiifUrl = iiif_api +'/'+ $scope.r.repo + "." + $scope.r.nick + "." + dashedId + '&search=' + encodeURIComponent(query) + '&json';
                        var iiifUrl = iiif_api + '/viewer/excerpt.php?handle=' + newHandle + '&search=' + encodeURIComponent(query) + '&json';
                        $http.get(iiifUrl).then(function (response) {
                            if (website_env !== 'prod') {
                                console.log('inner response', response.data);
                            }

                            if (!response.data) {
                                $scope.innerContent = {
                                    error: true
                                }
                            } else if (response.data.error) {
                                $scope.innerContent = {
                                    error: true,
                                    pData: response.data
                                };
                            } else {
                                var pages = [];
                                for (var i in response.data) {
                                    var p = {page: parseInt(i) + 1, index: i};
                                    pages.push(p);
                                    response.data[i].pI = i;
                                }
                                $scope.innerContent = {
                                    error: false,
                                    query: query,
                                    handle: newHandle,
                                    pages: pages,
                                    pData: response.data
                                };

                            }
                            // console.log($scope.innerContent);
                        }, function (error) {
                            // console.log('inner data error', error);
                            $scope.innerContent = {
                                error: true
                            }
                        });

                    }
                }

                // SAVE RESULT TO FOLDER
                $scope.saveResult = function (r) {
                    $scope.r.saved = rExport.save(r);
                };
                $scope.$watch(function () {
                    return rExport.saved;
                }, function (val) {
                    $scope.r.saved = rExport.isSaved($scope.r._id);
                });
            }
        ]);


    /************** RESULTS DIRECTIVES *****************/
    // parent
    resultsApp.directive('resultsView', function () {
        return {
            restrict: 'EA',
            templateUrl: templatePath + 'results-parent.html?version=' + app_version,
        };
    })

    //views
        .directive('resultsList', function () {
            function link(scope, element, attrs) {
                var btn = element.find('.dl-r-more'),
                    hide = element.find('.dl-r-metadata-table');
                hide.simpleSlide(btn);
            }

            return {
                restrict: 'A',
                templateUrl: templatePath + 'results-list.html?version=' + app_version,
                link: link
            };
        })
        .directive('mainpageSearchOptions', function () {
            return {
                restrict: 'E',
                templateUrl: templatePath + 'mainpage-search-options.html?version=' + app_version,
            };
        })
        .directive('mainpageResultsHeader', function () {
            return {
                restrict: 'E',
                templateUrl: templatePath + 'mainpage-results-header.html?version=' + app_version,
            };
        })

        .directive('mainpageHeader', function () {
            return {
                restrict: 'E',
                templateUrl: templatePath + 'mainpage-header.html?version=' + app_version,
            };
        })

        .directive('mainpageFooter', function () {
            return {
                restrict: 'E',
                templateUrl: templatePath + 'mainpage-footer.html?version=' + app_version,
            };
        })

        // INNER RESULTS DIRECTIVES
        .directive('innerResults', ["utility", function (utility) {
            return {
                restrict: 'EA',
                templateUrl: templatePath + 'inner-results.html?version=' + app_version,
                scope: {data: '='},
                controller: ["$scope", function ($scope) {
                    if ($scope.data.error) {
                        $scope.innerError = true;
                    } else {
                        $scope.currentPi = $scope.data.pages[0].index;
                        $scope.pClick = function (pi) {
                            if ($scope.currentPi === pi) {
                                utility.gaEvent('search_results', 'inner_result', 'clickthrough');
                                var split = $scope.data.pData[pi].access.split(':');
                                document.location = split.join(':');
                            } else {
                                $scope.currentPi = pi;
                            }
                        };

                    }
                }]
            };
        }])
        // only show highlight divs after images have loaded
        .directive('hlonload', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('load', function () {
                        $(this).css('background', 'none').nextAll('.highlight').css('visibility', 'visible');
                    });
                }
            };
        });

    return resultsApp;
});
