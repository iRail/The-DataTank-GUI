window.App = (function ($) {
    window.jQueryView = Backbone.View.extend({
        initialize: function() {
            this.el = $(this.el);
            this.template = $(this.template);
        },
    });

    window.Package = Backbone.Model.extend({

    });

    window.PackageCollection = Backbone.Collection.extend({
        model: Package,

        url: '/TDTInfo/Resources.json',

        parse: function(response) {
            var keys = _.keys(response);
            console.log('keys: ', keys);
            return _.map(keys, function(key) {
                return {name: key, create_date: new Date()} 
            });
        },

    });

    window.Packages = new PackageCollection();

    window.PackageView = jQueryView.extend({
        el: '#admin-packages',

        template: '#admin-package-template',

        initialize: function() {
            jQueryView.prototype.initialize.call(this);
        },

        render: function() {
            console.log('pkgs: ', Packages.models);
            this.el.html(this.template.tmpl({packages: Packages.models}));
            console.log('render');
        }
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

        validate: function(attr) {
            if ($('#admin-package-name').val() == '') {
                return 'Name can not be empty.';
            }
        },

        createPackage: function() {
            var name = $('#admin-package-name').val();
            Packages.add({name: name});
            $('#admin-package-name').val('');
            console.log('Create: ' + name);
        },
    });

    var self = {};
    self.start = function() {
        console.log('1');
        Packages.fetch({success: function() {
            new AdminPackageView();
            var v = new PackageView();
            v.render();
        }});

        console.log('2');
    };
    return self;
});

$(function() {
    // Monkey path Date to add a function that returns the short name of
    // a month.
    Date.prototype.getMonthName = function() {
        var months = {
            0: 'January',
            1: 'Febuary',
            2: 'March',
            3: 'April',
            4: 'May',
            5: 'June',
            6: 'Julu',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'December',
        };
        console.log('hello time', months[this.getMonth()]);
        return months[this.getMonth()];
    };
    
    new App(jQuery).start();
});
