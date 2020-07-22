define(function (require) {
    // "use strict";
    var angular = require('angular');
    var ngAnimate = require('ngAnimate');

    var animations = angular.module('dlAnimations', ['ngAnimate']);

    animations.animation('.dl-ani-hide', function(){
        var open = function(element, className, done){
            console.log('open!', element);
            element.hide();
            return function(cancel) {
              if(cancel) {
                element.stop();
              }
            };
        };

        var closed = function(element, className, done){
            return function(cancel) {
              if(cancel) {
                element.stop();
              }
            };
        };

        return {
            beforeAddClass: closed,
            removeClass: open,
            enter: open,
            leave: closed
        };
    });

    animations.animation('.dl-f-more', function(){
        var showAll = function(element, className, done){
            // console.log(className);
            if( className == 'showAll'){
                console.log('show all!');
                var opt = element.parent().find('.dl-f-options');
                var realH = opt[0].scrollHeight;
            } else {
                done();
            }

        };

        var showLess = function(element, className, done){
             if( className == 'showAll'){
                var opt = element.parent().find('.dl-f-options');
                var realH = opt[0].scrollHeight;
             } else {
                done();
            }
        };

        return {
            addClass: showAll,
            removeClass: showLess
        };
    });

    return animations;
});
