window.App = (function ($, _, Backbone) {

    /*** Basic UI elements ***/

    // Extend View as to allow jquery object as elements instead of strings.
    window.jQueryView = Backbone.View.extend({
        initialize: function() {
            this.el = $(this.el);
            this.template = $(this.template);
        },
    });

    window.AdminView = jQueryView.extend({
        initialize: function() {
            // Super
            jQueryView.prototype.initialize.call(this);
        },
            
        render: function() {
            this.el.removeClass('hidden');
        },

        hide: function() {
            this.el.addClass('hidden');
        },
    });

    window.ModalBox = Backbone.View.extend({
        el: '#admin-package-remove-modal',
    });

    /*** Index ***/

    window.IndexAdminView = AdminView.extend({
        el: '#admin-admin',

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);
        },

    });

    /*** Package ***/

    window.Package = Backbone.Model.extend({
        getPackageUrl: function() {
            return window.TDT_URL + '/' + this.get('name') + '/'
        },
    });

    window.PackageCollection = Backbone.Collection.extend({
        model: Package,

        url: '/TDTInfo/Packages',

        parse: function(response) {
            return _.map(response.Packages, function(o) {
                // Multiply by 1000 because timestamp is in seconds instead of
                // microseconds.               
                return {name: o.package_name, creation_date: new Date(o.timestamp*1000)};
            });
        },
    });
    window.Packages = new PackageCollection();

    window.PackageRemoveModal = jQueryView.extend({
        el: '#admin-package-remove-modal',

        initialize: function(params) {
            // Super
            jQueryView.prototype.initialize.call(this);
            var that = this;
            //this.package = params.package;
            this.resources = Resources.filter(function(resource) {
                return resource.get('package') === that.model.get('name');
            });
            this.el.find('.modal-header h3').html('Removing "' + this.model.get('name') + '"');
            this.el.find('.modal-body').html('Are you shure you want to remove this packages with all of its resources?<ul>');
            // TODO add list of all resources of package.
            //$.tmpl('#admin-package-remove-resources-modal', this.resources).appendTo(
                //this.el.find('.modal-body')
            //);

            // Show modal box
            this.el.modal({
                backdrop: true,
                keyboard: true,
            });
        },

        events: {
            'click #admin-package-remove-remove': 'removePackage',
            'click #admin-package-remove-cancel': 'cancel',
        },

        removePackage: function() {
            console.log('Remove');
            Packages.remove(this.model, {silent: true});
        },

        cancel: function() {
            console.log('Cancel remove');
            this.el.modal('toggle')
        },
    });

    window.PackageView = jQueryView.extend({
        tagName: 'tr',

        template: '#admin-package-template',

        initialize: function(model) {
            console.log('cr pam');
            // Super
            jQueryView.prototype.initialize.call(this);

            //this.removeModalTemplate = $('#admin-package-remove-modal-template');
            Packages.bind('add', this.addOne, this);
        },

        events: {
            'click .admin-packages-remove': 'removePackage',
            'click .admin-packages-name': 'detailPackage',
        },

        removePackage: function() {
            var modal = new PackageRemoveModal({model: this.model});
        },

        detailPackage: function() {
            alert('detail');
        },

        render: function() {
            this.el.html(this.template.tmpl({pkg: this.model}));
            return this;
        },
    });

    window.PackageAdminView = AdminView.extend({
        el: '#admin-package',

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);

            Packages.bind('add',   this.addOne, this);
            Packages.bind('reset', this.addAll, this);
            Packages.bind('all',   this.render, this);

            //this._packageView = new PackageView();
            Packages.fetch({
                success: function() {
                    console.log('Successfully fetched pkgs. (pav)');
                },
                error: function() {
                    console.log('Error while fetching pkgs. (pav)');
                },
            });
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

        createPackageOnEnter: function(e) {
            var text = $('#admin-package-name').val();
            if (!text || e.keyCode != 13) return;
            this.createPackage();
        },

        createPackage: function() {
            var name = $('#admin-package-name').val();
            Packages.create({name: name});
            $('#admin-package-name').val('');
        },

        addOne: function(package) {
            var view = new PackageView({model: package});
            this.$("#admin-packages").append(view.render().el);
        },

        addAll: function() {
            Packages.each(this.addOne);
        },
    });

    window.PackageDetailsAdminView = AdminView.extend({
        el: 'admin-package-details',

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);
        },
    });


    /*** Resources ***/

    window.Resource = Backbone.Model.extend({
        getResourceUrl: function() {
            return window.TDT_URL + '/' + this.get('package') + '/' + this.get('name');
        },
    });

    window.ResourceList = Backbone.Collection.extend({
        model: Resource,

        url: '/TDTInfo/Resources',

        parse: function(response) {
            var resources = [];
            var packages = _.keys(response);
            // Multiply by 1000 because timestamp is in seconds instead of
            // microseconds.
            _.each(packages, function(package) {
                var partialResources = _.keys(response[package]);
                _.each(partialResources, function(name) {
                    var resource = {
                        name: name,
                        type: 'CSV',
                        package: package,
                        last_modified: new Date(
                            response[package][name].modification_timestamp * 1000
                        ),
                        creation_date: new Date(
                            response[package][name].creation_timestamp * 1000
                        ),
                    }
                    resources.push(resource);
                });
            });
            return resources;
        },
    });
    window.Resources = new ResourceList();

    window.ResourceView = jQueryView.extend({
        tagName: 'tr',

        template: '#admin-resource-template',

        initialize: function(model) {
            // super
            //this.model = model;
            jQueryView.prototype.initialize.call(this);
            //Resource.bind('add', this.addOne, this);
        },

        render: function() {
            this.el.html(this.template.tmpl({resource: this.model}));
            return this;
        },
    });

    window.ResourceAdminView = AdminView.extend({
        el: '#admin-resource',

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);

            Resources.bind('add',   this.addOne, this);
            Resources.bind('reset', this.addAll, this);
            Resources.bind('all',   this.render, this);

            this.name = $('#admin-resource-name');
            this.path = $('#admin-resource-path');
            this.columns = $('#admin-resource-columns');
            this.primaryKey = $('#admin-resource-pk');
            this.pkg = $('#admin-resource-pkg');
            this.doc = $('#admin-resource-doc');
            
            // Fill Resources
            Resources.fetch({
                success: function() {
                    console.log('Successfully fetched recs. (rav)');
                },
                error: function() {
                    console.log('Error while fetching recs. (rav)');
                },
            });

            // Fill Packages for the package select input.
            var self = this;
            this.pkg.empty();
            self.pkg.append('<option>-- Select a package --</option>');
            _.each(Packages.models, function(pkg) {
                self.pkg.append('<option>' + pkg.get('name') + '</option>');
            });
        },

        events: {
            'click #admin-resource-save': 'createResource',
        },

        validate: function(attr) {
            console.log('validate');
        },

        createResource: function() {
            console.log('create resource...');
            var self = this;
            var name = this.name.val();
            var path = this.path.val();
            var columns = this.columns.val();
            var primaryKey = this.primaryKey.val();
            var pkg = this.pkg.val();
            var doc = this.doc.val();
            $.ajax({
                url: window.TDT_URL + '/' + pkg +'/' + name,
                contentType: 'application/json',
                type: 'PUT',
                data: {
                    resource_type: 'generic',
                    printmethods: 'json;xml;jsonp',
                    generic_type: 'CSV',
                    documentation: doc,
                    uri: path,
                    columns: columns,
                    PK: primaryKey,
                },
                success: function() {
                    console.log('Success in creating resource');
                    self.name.val('');
                    self.path.val('');
                    self.columns.val('');
                    self.primaryKey.val('');
                    self.pkg.val('');
                    self.doc.val('');
                    Resources.fetch({
                        success: function() {
                            console.log('Successfully fetched recs. (rav)');
                        },
                        error: function() {
                            console.log('Error while fetching recs. (rav)');
                        },
                    });
                },
                error: function() {
                    console.log('FAIL');
                }
            });
        },

        addOne: function(resource) {
            var view = new ResourceView({model: resource});
            this.$("#admin-resources").append(view.render().el);
        },

        addAll: function() {
            Resources.each(this.addOne);
        },
    });

    /*** Profile ***/

    window.ProfileAdminView = AdminView.extend({
        el: '#admin-profile',

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);
        },
    });

    /*** Login & Logout ***/

    window.LoginAdminView = AdminView.extend({
        el: "#admin-login",

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);
        },
    });

    window.LogoutAdminView = AdminView.extend({
        el: "#admin-logout",

        initialize: function() {
            // Super
            AdminView.prototype.initialize.call(this);
        },
    });

    /*** Workspace ***/

    window.Workspace = Backbone.Router.extend({
        _index: null,
        _packages: null,
        _resources: null,
        _profile: null,
        _login: null,
        _logout: null,
        _handlePage: null,
        _createdPages: [],
        _menu: null,
        _menuItems: {
            'admin-admin': '#admin-menu-i   ndex',
            'admin-package': '#admin-menu-packages',
            'admin-resource': '#admin-menu-resources',
            'admin-profile': '#admin-menu-profile',
            'admin-login': '#admin-menu-login',
            'admin-logout': '#admin-menu-logout',
        },

        initialize: function() {
            this._menu = $('#admin-menu li');
            _.extend(this._menu, $('.secondary-nav li'));
        },

        activatePage: function(page) {
            var self = this;
            _.each(this._createdPages, function(p) {
                p.hide();
            });
            page.render();
            self.activateMenuItem(page.el.attr('id'));
        },

        activateMenuItem: function(item) {
            console.log('item: ', item);
            this._menu.each(function(index) {
                $(this).removeClass('active');
            });
            console.log('Menu: ', item);
            $(this._menuItems[item]).addClass('active');
        },

        routes: {
            '': 'index',
            'packages': 'packages',
            'packages/:name': 'packageDetails',
            'resources': 'resources',
            'resources/:name': 'resourceDetails',
            'profile': 'profile',
            'login': 'login',
            'logout': 'logout',
        },

        // A generic page handler that returns a function that creates a page
        // handler for `page` and creates a coresponding view with `view`.
        _handlePage: function(context, page, view) {
            console.log('page: ' + page);
            if (!context[page]) {
                context[page] = new view();
                this._createdPages.push(context[page]);
            }
            console.log('page: ' + context[page]);
            this.activatePage(context[page]);
        },

        index: function() {
            this._handlePage(this, '_index', IndexAdminView)
        },

        packages: function() {
            this._handlePage(this, '_packages', PackageAdminView)
        },

        packageDetails: function() {
            this._handlePage(this, '_packageDetails', PackageDetailsAdminView)
        },

        resources: function() {
            this._handlePage(this, '_resources', ResourceAdminView)
        },

        resourceDetails: function() {
            this._handlePage(this, '_resourceDetails', ResourcDetailseAdminView)
        },

        profile: function() {
            this._handlePage(this, '_profile', ProfileAdminView)
        },

        login: function() {
            this._handlePage(this, '_login', LoginAdminView)
        },

        logout: function() {
            this._handlePage(this, '_logout', ResourceAdminView)
        },
    });

    /*** Start ***/

    var self = {};
    self.start = function() {
        var workspace = new Workspace();
        var r =  Backbone.history.start({
            //pushState: true,
            root: '/~abe/The-DataTank-GUI/app.php/admin'
        });
    };
    return self;
});

$(function() {
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
        
        // Use a different url and method for Packages.
        if (model instanceof Package) {
            if (method === 'create') {
                params.url = model.getPackageUrl();
                params.type = 'PUT';
            } else if (method === 'update') {
                params.url = model.getPackageUrl();
                params.type = 'POST';
            } else if (method === 'delete') {
                console.log('==========================================================>Sync: delete pkg');
                params.url = window.TDT_URL + '/' + params.model.get('name');
                params.type = 'DELETE';
            }
        }
        // Use a different url and method for Resources.
        if (model instanceof Resource) {
            if (method === 'create') {
                params.url = model.getResourceUrl();
                params.type = 'PUT';
            } else if (method === 'update') {
                params.url = model.getResourceUrl();
                params.type = 'POST';
            } else if (method === 'delete') {
                params.url = model.getResourceUrl();
                params.type = 'DELETE';
            }
        }

        // Make the request.
        return $.ajax(params);
    };
    
    new App(jQuery, _, Backbone).start();
});
