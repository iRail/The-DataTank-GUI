(function ($) {
    window.restfulApp = Backbone.Router.extend({
        //Routes tell the app what to do
        routes: {
            "": "index", 
        },
        index: function() {console.log('index');}
    });

    var app = restfulApp();
    //Initiate a new history and controller class
    //Backbone.emulateHTTP = true;
    //Backbone.emulateJSON = true
    Backbone.history.start();
})(jQuery);

//(function($, _, Backbone) {
    //var Router = Backbone.Router.extend({
        //routes: {
            //'': 'index',
        //},
        //index: function() {
            //console.log('route index');
        //},
    //});

    //var router = new Router();

    //Backbone.history.start();

    ////Backbone.history.start();

    ////$(document).ready(function() {
        ////console.log('hello');
        ////var resourcePage = $('a[href="#admin-resources"');
        ////resourcePage.click(function() {
            ////alert('hello');
            ////$('#admin-resource').removeClass('hidden');
        ////});

        ////var app = App(jQuery, _, Backbone);
    ////});
//})(jQuery, _, Backbone);


