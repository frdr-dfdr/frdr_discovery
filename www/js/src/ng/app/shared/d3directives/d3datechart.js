define(function (require){

    var angular = require('angular'),
        d3 = require('d3'),
        d3charts = require('d3directives'),
        services = require('services/services');
    
    d3charts.directive('datechart',['$window', '$timeout', 'esSearchString', 'datechart', 'utility', function($window, $timeout, searchString, datechart, utility){
    
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                selection: '=',
                title: '@',
                onClick: '&'
            },
            link: function($scope, ele, attrs){

                var renderTimeout;

                var title = $scope.title;

                 var margin = {
                        top: parseInt(attrs.margin) || 3,
                        right: parseInt(attrs.margin) || 10,
                        bottom: parseInt(attrs.margin) || 12,
                        left: parseInt(attrs.margin) || 10,
                    },
                    height = 100;

                 var svg = d3.select(ele[0]).append('svg');

                var cleanD = utility.cleanDates($scope.data);
                render(cleanD);

                datechart.onDrawDateChart(function(e, d){
                    cleanD = utility.cleanDates(d);
                    return render(cleanD);                    
                });

                // $scope.render = function(data) {
                function render(data){
                    // console.log('datechart render', data)
                  // remove all previous items before render
                    svg.selectAll('*').remove();
                    // If we don't pass any data, return out of the element
                    if (!data || Object.keys(data).length === 0 ) return console.log('Date chart not yet ready to render');

                    // setup variables
                    var wd = ele.parent().width() < 200 ? ele.closest('.dl-f-group').width() : ele.parent().width();
                    var width = wd - margin.right - margin.left;
                    var chartHeight = height - margin.top - margin.bottom;
                    //console.log(ele, width);
                    elem = ele;
                    // var dateFormat = d3.timeFormat('%Y-%m-%d');
                    // var parseDate = dateFormat.parse;
                    // var parseDate = new Date(time);

                    var x = d3.scaleTime()
                            .range([0, width]);

                    var y = d3.scaleLinear()
                            .range([chartHeight, 0]);

                    var xAxis = d3.axisBottom()
                                .scale(x)
                                .ticks(4)
                                .tickSize(1);

                    var yAxis = d3.axisLeft()
                                .scale(y)
                                .ticks(3);

                    var emptyArea = d3.area()
                                    .x(function(d) { return x(d.key); })
                                    .y(chartHeight)
                                    .curve(d3.curveStep);

                    var area = d3.area()
                                .x(function(d) { return x(d.key); })
                                .y0(chartHeight)
                                .y1(function(d){ return y(d.count); })
                                .curve(d3.curveStep);

                    // parse data
                    data.forEach(function(d){
                        d.count = +d.doc_count;
                    });

                    //sort data by date!!
                    data.sort(function(a, b){
                        return d3.ascending(a.key, b.key);
                    });

                    // parse range from searchString

                    var selectedRange = searchString.vars.filter.sortDate;

                    // console.log('selectedRange dates', selectedRange.begin, selectedRange.end);
                    // console.log('selectedRange', selectedRange);

                    // set domains
                    if (selectedRange.begin.key && selectedRange.end.key) {
                        x.domain([selectedRange.begin.key, selectedRange.end.key]);
                        // console.log('x domain using SELECTION.', x.domain());
                    } else {
                        x.domain(d3.extent(data, function(d){ return d.key; }));
                        // console.log('x domain using DATA.', x.domain())
                    }

                    // x.domain()
                    // console.log('x-domain', x.domain());
                    y.domain([0, d3.max(data, function(d){ return d.count; })]);

                    // set scope begin/end
                    updateRangeDomain();
                    
                    
                    svg.attr('width', width + margin.left + margin.right)
                        .attr('height', height);

                    var chart = svg.append('g')
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    //draw area
                    chart.append('path')
                        .data([data])
                        .attr('class', 'date-chart-area')
                        .attr('d', emptyArea)
                            .transition().duration(600)
                            .attr('d', area);

                    // add x axis
                    chart.append('g')
                        .attr('class', 'xaxis')
                        .attr('transform', 'translate(0,' + chartHeight + ')')
                        .call(xAxis);

                    // brush behavior

                    var brush = d3.brushX()
                                .extent([[x.range()[0], 0], [x.range()[1], chartHeight]])
                                .on("start", brushstart)
                                .on("brush", brushmove)
                                .on("end", brushend);

                    // brush background
                    var brushbg = chart.append('g')
                            .attr('class','brushbg');

                    var brushg = chart.append("g")
                        .attr("class", "brush")
                        .call(brush);

                    brushbg.append('rect')
                        .attr('class', 'bbg l')
                        .attr('height', chartHeight);

                    brushbg.append('rect')
                        .attr('class', 'bbg r')
                        .attr('height', chartHeight);

                    // brush ends / 'handles'
                    brushg.selectAll(".handle")
                        .attr('x', '-5')
                        .attr('width', '10')
                        .append('rect')
                            .attr('x', '-1')
                            .attr('width', 2)
                            .style('visibility', 'visible')
                            .style('fill', 'orange');

                    brushg.selectAll('.overlay')
                            .style({'visibility': 'visible', 'fill': 'none'});

                    brushg.selectAll('.overlay')                            
                            .append('rect')
                                .attr('class', 'left')
                                .attr('x', 0)
                                .attr('width', 20)
                                .style({'fill': 'red', 'visibility': 'visible'});

                    brushg.selectAll("rect")
                        .attr("height", chartHeight);

                    function brushstart() {
                        updateRangeBrush();
                        updateRangeDomain('apply');
                    }

                    function brushmove() {
                        updateRangeBrush();
                        updateRangeDomain('apply');
                        updateBBG();
                    }

                    function brushend() {
                        // if empty or full domain return without call to refresh and clear bg
                        if (d3.event.selection === null || d3.values(brush.extent()).join() === d3.values(x.domain()).join()){
                            updateRangeDomain('apply');
                            brushbg.selectAll('.bbg')
                                .attr('width', 0);
                            return;
                        } else {
                            utility.gaEvent('facets','date_picker', 'brush_select');
                            xZoom(d3.event.selection.map(x.invert)[0], d3.event.selection.map(x.invert)[1]);
                        }

                    }

                    function updateBBG() {
                        // update background shading around brush selection
                        var eX = parseInt(svg.selectAll('.brush .selection').attr('x'));
                        var eW = parseInt(svg.selectAll('.brush .selection').attr('width'));

                        svg.select('.bbg.l')
                            .attr('x', 0)
                            .attr('width', function(){
                                return eX;
                        });
                        svg.select('.bbg.r')
                            .attr('x', function(){
                                // console.log('x', eX, 'w', eW, 'both', eX + eW);
                                return eX + eW;
                            })
                            .attr('width', function(){
                                return width - eW - eX;
                        });
                    }

                    function updateRangeDomain(a) {
                        if (d3.event != null) {
                            $scope.selection = {
                                begin: {
                                    display: displayDate(d3.event.selection.map(x.invert)[0]),
                                    key: +d3.event.selection.map(x.invert)[0]
                                },
                                end: {
                                    display: displayDate(d3.event.selection.map(x.invert)[1]),
                                    key: +d3.event.selection.map(x.invert)[1]
                                }
                            };
                        } else {
                            $scope.selection = {
                                begin: {
                                    display: displayDate(x.domain()[0]),
                                    key: +x.domain()[0]
                                },
                                end: {
                                    display: displayDate(x.domain()[1]),
                                    key: +x.domain()[1]
                                }
                            };                            
                        }
                        if (a === 'apply'){
                            $scope.$apply();
                        }
                    }
                    
                    function updateRangeBrush() {
                        $scope.selection = {
                            begin: {
                                display: displayDate(brush.extent()[0]),
                                key: +brush.extent()[0]
                            },
                            end: {
                                display: displayDate(brush.extent()[1]),
                                key: +brush.extent()[1]
                            }
                        };
                        $scope.$apply();
                        // console.log($scope.range.begin.display, $scope.range.end.display);
                    }

                    function displayDate(d) {
                        var format = d3.timeFormat('%Y');

                        var display = format(d);

                        var negative = /^-\d+$/;

                        if(display.match(negative)){
                            display = display.replace(/^-(0*)?/, '');
                            display = display.concat(' BCE');
                            // console.log(display);
                        } else {
                            display = display.replace(/^(0{1,3})?/, '');
                        }

                        return display;
                    } 


                    // watch input for changes and update keys & graph:

                    $scope.$watch('selection', function(newVals, oldVals) {

                        var newBegin,
                            newEnd;

                        if (newVals.begin.display != oldVals.begin.display && newVals.begin.key === oldVals.begin.key) {
                            newBegin = parseDate(newVals.begin.display);
      
                        }

                        if (newVals.end.display != oldVals.end.display && newVals.end.key === oldVals.end.key) {
                            newEnd = parseDate(newVals.end.display);

                        }

                        if (newBegin || newEnd){

                            // set vars
                            newBegin = newBegin || newVals.begin.key;
                            newEnd = newEnd || newVals.end.key;

                            //set keys
                            $scope.selection.begin.key = newBegin;
                            $scope.selection.end.key = newEnd; 

                             // valid range?
                            if (parseInt(newVals.begin.key) > parseInt(newVals.end.key)){
                                if(website_env !== 'prod') {
                                    console.log('invalid date range');
                                }
                                return;
                            }

                            xZoom(newBegin, newEnd);

                        }

                    }, true);

                    function xZoom(newBegin, newEnd){
                        if(website_env !== 'prod') {
                            console.log(newBegin, newEnd);

                            console.log(x.domain(), x.range());
                        }

                        // expand graph if selected dates are outside visible area
                        if (newBegin < +x.domain()[0]){  
                            var end = +x.domain()[1];
                            x.domain([newBegin, end]);
                        }
                        if (newEnd > +x.domain()[1]){
                            
                            var begin = +x.domain()[0];
                            x.domain([begin, newEnd]);
                        }

                        // x.domain([newBegin, newEnd]);
                        updateXAxis();

                        chart.select('.date-chart-area').data([data])
                            .transition().duration(300).ease(d3.easeSinInOut)
                            .attr("d", area);
                        //brush.clear().x(x);
                        
                        brush.extent([newBegin, newEnd]);
                        //svg.select('.brush').call(brush);
                        updateBBG(); 

                    }

                    function updateXAxis(){
                       svg.select('.xaxis')
                                .transition().duration(300).ease(d3.easeSinInOut)
                                .call(xAxis);
                    }


                    function parseDate(date){

                        var bce = /\s(BCE)$/;

                        // if BCE, make negative
                        if (date.match(bce)){

                            date = date.replace(bce, '');
                            date = parseInt(date);
                            date = padToSix(date);
                            date = '-' + date;
                            // console.log(date);
                        }

                        // if shorter than 4 num, add padding so dates < 1000 work
                        else if (date.length < 4) {
                           date = padToSix(date);
                        }

                        date = new Date(date);

                        // add a day to get right year
                        date = +date + 86400000;

                        return date;

                        function padToSix(number) {
                          if (number<=999999) { number = ("00000"+number).slice(-6); }
                          return number;
                        }

                    }
                }
            }
        };
    }]);

    services.factory('datechart', ['$rootScope', function($rootScope){
        var datechart = {};
        
        // trigger new date chart (replaces expensive 'watch' on data)
        
        datechart.drawDateChart = function(d){
            datechart.d = d;
            $rootScope.$emit('drawdatechart', d);
        };
        datechart.onDrawDateChart = function(callback){
            $rootScope.$on('drawdatechart', callback);
        };
        // datechart.refreshInputs = function(){

        //     var refreshed = {
        //             begin: {
        //                 display: displayDate(x.domain[0]),
        //                 key: +x.domain()[0]
        //             },
        //             end: {
        //                 display: displayDate(x.domain()[1]),
        //                 key: +x.domain()[1]
        //             }
        //         };
        //     return refreshed;

        // };
        // datechart.refreshInputs = function(d){
        //     datechart.d = d;
        //     $rootScope.$emit('refreshinputs', d);
        // };
        // datechart.refreshedInputs = function(callback){
        //     $rootScope.$on('refreshinputs', callback);
        // };
        return datechart;
    }]);

});