window.App = (function ($, _, Backbone) {
    // Extend View as to allow jquery object as elements instead of strings.
    window.jQueryView = Backbone.View.extend({
        initialize: function() {
            this.el = $(this.el);
            this.template = $(this.template);
        },
    });

    window.Workspace = Backbone.Router.extend({
        _index: null,
        _packages: null,
        _resources: null,
        _profile: null,
        _login: null,
        _logout: null,
        _menu: null,
        _menuItems: {
            'index': '#admin-menu-index',
            'packages': '#admin-menu-packages',
            'resources': '#admin-menu-resources',
            'profile': '#admin-menu-profile',
        },

        initialize: function() {
            this._menu = $('#admin-menu li');
            this._packages = new PackageAdminView();
            this._resources = new ResourceAdminView();
            this._profile = new ProfileAdminView();
            this._index = new IndexAdminView();
        },

        activateMenuItem: function(item) {
            this._menu.each(function(index) {
                $(this).removeClass('active');
            });
            console.log('Menu: ', item);
            $(this._menuItems[item]).addClass('active');
        },

        routes: {
            '': 'index',
            'packages': 'packages',
            'resources': 'resources',
        },

        index: function() {
            this.activateMenuItem('index');
            this._index.render();
            this._packages.hide();
            this._resources.hide();
            this._profile.hide();
        },

        packages: function() {
            this.activateMenuItem('packages');
            this._packages.render();
            this._index.hide();
            this._resources.hide();
            this._profile.hide();
        },

        resources: function() {
            this.activateMenuItem('resources');
            this._resources.render();
            this._index.hide();
            this._packages.hide();
            this._profile.hide();
        },

        profile: function() {
            console.log('profile');
            this.activateMenuItem('profile');
            this._profile.render();
            this._resources.hide();
            this._index.hide();
            this._packages.hide();
        },

        login: function() {

        },

        logout: function() {

        },
    });

    /*** Index ***/
    window.IndexAdminView = jQueryView.extend({
        el: '#admin-admin',

        render: function() {
            this.el.removeClass('hidden');
        },

        hide: function() {
            this.el.addClass('hidden');
        },
    });

    /*** Package ***/

    window.Package = Backbone.Model.extend({
        getPackageUrl: function() {
            return window.__HOSTNAME + window.__SUBPATH + this.get('name') + '/'
        },
    });

    window.PackageCollection = Backbone.Collection.extend({
        model: Package,

        url: '/TDTInfo/Resources',

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
        _packageView: null,

        template: '#admin-package-template',

        initialize: function() {
            // super
            jQueryView.prototype.initialize.call(this);
            Packages.bind('add', this.addOne, this);
        },

        render: function() {
            console.log('pkgs: ', Packages.models);
            this.el.html(this.template.tmpl({packages: Packages.models}));
            console.log('render');
        },
    });

    window.PackageAdminView = jQueryView.extend({
        el: '#admin-package',
        _packageView: null,

        initialize: function() {
            // super
            jQueryView.prototype.initialize.call(this);

            this._packageView = new PackageView();
            Packages.fetch({success: function() {
                console.log('fetch');
            }});

        },

        events: {
            "keypress #admin-package-name":  "createPackageOnEnter",
            'click #admin-package-save': 'createPackage',
        },

        validate: function(attr) {
            if ($('#admin-package-name').val() == '') {
                return 'Name can not be empty.';
            }
        },

        createPackageOnEnter: function() {
            var text = $('#admin-package-name').val();
            if (!text || e.keyCode != 13) return;
            this.createPackage();
        },

        createPackage: function() {
            var name = $('#admin-package-name').val();
            Packages.create({name: name});
            $('#admin-package-name').val('');
            console.log('Create: ' + name);
        },

        render: function() {
            this.el.removeClass('hidden');
        },

        hide: function() {
            this.el.addClass('hidden');
        },
    });

    /*** Resources ***/
    window.Resource = Backbone.Model.extend({

    });

    window.ResourceList = Backbone.Collection.extend({

    });
    window.Resources = new ResourceList();

    window.ResourceView = jQueryView.extend({

    });

    window.ResourceAdminView = jQueryView.extend({
        el: '#admin-resource',

        render: function() {
            this.el.removeClass('hidden');
        },

        hide: function() {
            this.el.addClass('hidden');
        },
    });

    /*** Profile ***/
    window.ProfileAdminView = jQueryView.extend({
        el: '#admin-profile',

        render: function() {
            this.el.removeClass('hidden');
        },

        hide: function() {
            this.el.addClass('hidden');
        },
    })

    var self = {};
    self.start = function() {
        var workspace = new Workspace();
        console.log('Workspace: ', workspace);
        var r =  Backbone.history.start({
            //pushState: true,
            root: '/~abe/The-DataTank-GUI/app.php/admin'
        });
        //Packages.fetch({success: function() {
            //new PackageAdminView();
            //var v = new PackageView();
            //v.render();
        //}});
    };
    return self;
});

$(function() {
    window.__HOSTNAME = 'http://localhost';
    window.__SUBPATH = '/';
    // Monkey path Date to add a function that returns the name of the month.
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
        return months[this.getMonth()];
    };

    // Monkey path Backbone.sync to make it work with the sucky backend api.
    Backbone.sync = function(method, model, options) {
        // Helper function to get a URL from a Model or Collection as a property
        // or as a function.
        var getUrl = function(object) {
            if (!(object && object.url)) return null;
            return _.isFunction(object.url) ? object.url() : object.url;
        };

        // Throw an error when a URL is needed, and none is supplied.
        var urlError = function() {
            throw new Error('A "url" property or function must be specified');
        };
        
        var methodMap = {
            'create': 'POST',
            'update': 'PUT',
            'delete': 'DELETE',
            'read'  : 'GET'
        };
        
        var type = methodMap[method];

        // Default JSON-request options.
        var params = _.extend({
            type: type,
            dataType: 'json',
            //beforeSend: function(xhr) {
            //    xhr.setRequestHeader("Authorization", "Basic " + encodeBase64(':'));
            //},
        }, options);

        // Ensure that we have a URL.
        if (!params.url) {
            params.url = getUrl(model) || urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!params.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }
        
        // Use a different url and method for Packages
        if (model instanceof Package) {
            if (method === 'create') {
                params.url = model.getPackageUrl();
                params.type = 'PUT';
            } else if (method === 'update') {
                params.url = model.getPackageUrl();
                params.type = 'POST';
            } else if (method === 'delete') {
                params.url = model.getPackageUrl();
                params.type = 'DELETE';
            }
        }
        // Make the request.
        return $.ajax(params);
    };
    
    new App(jQuery, _, Backbone).start();
});
