window.App = (function ($) {
    window.jQueryView = Backbone.View.extend({
        initialize: function() {
            this.el = $(this.el);
        },
    });

    window.Package = Backbone.Model.extend({

    });

    window.PackageCollection = Backbone.Collection.extend({

    });

    window.PackageView = jQueryView.extend({
        initialize: function() {
            jQueryView.prototype.initialize.call(this);
        },
    });

    window.AdminPackageView = jQueryView.extend({
        el: '#admin-package',

        initialize: function() {
            // super
            jQueryView.prototype.initialize.call(this);
        },

        events: {
            'click #admin-package-save': 'createPackage',
        },

        createPackage: function() {
            var name = $('#admin-package-name').val();
            console.log('Create: ' + name);
        },
    });

    var self = {};
    self.start = function() {
        console.log('1');
        new AdminPackageView();
        console.log('2');
    };
    return self;
});

$(function() {
    new App(jQuery).start();
});
