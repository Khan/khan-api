// Polyfill Function#bind if it's not present. See 
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {

  Function.prototype.bind = function(obj) {
    if (typeof this !== 'function') // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');

    var slice = [].slice,
        args = slice.call(arguments, 1), 
        self = this, 
        nop = function () {}, 
        bound = function () {
          return self.apply( this instanceof nop ? this : ( obj || {} ), 
                              args.concat( slice.call(arguments) ) );    
        };

    bound.prototype = this.prototype;
    return bound;
  };
}

(function($) {

  var Explorer = {};
  
  Explorer.API = Backbone.Model.extend({
    // Keeps track of the application state — what's being requested and
    // whether it's in progress.
    //
    // Has properties:
    // * url      (current URL to show in the address bar)
    // * response (JSON response for the current URL)
    // * state    (one of `uninitialized`, `pending`, `done`, or `error`)
    // * endpoint (current API endpoint, if any)
    // * params   (current URL parameters, if any)
    // * headers  (current response headers, if any)
    request: function(url) {
      // Blank URLs are invalid.
      if (url === "") return;
      
      function formatHeaders(xhr) {
        var originalHeaders = decodeURIComponent(xhr.getResponseHeader('X-Original-Headers')),
         originalStatus = xhr.getResponseHeader('X-Original-Status');

        // FIXME: Hack.
        var originalStatusText = { 401: 'Unauthorized', 200: 'OK' }[originalStatus] || "";
        
        var headers =  'HTTP/1.1 ' + originalStatus + ' ' + originalStatusText + '\n';
        return headers + originalHeaders;
      }
      
      this.set({
        url:      url,
        headers:  '',
        response: '',
        state:    'pending'
      });
      
      var fullUrl = this.getFullURL(url);
      
      var ajax = $.ajax(fullUrl, { dataType: 'json' });
      
      ajax.error(function(xhr, textStatus, errorThrown) {
        this.set({
          headers:  formatHeaders(xhr),
          response: xhr.responseText,
          state:    'error'
        });
      }.bind(this));

      ajax.success(function(data, textStatus, xhr) {
        var response = PrettyJSON.stringify(data);
        this.set({
          headers:  formatHeaders(xhr),
          response: response,
          state:    'done'
        });
      }.bind(this));
    },
    
    getFullURL: function(url) {
      var encoded = encodeURIComponent(url);
      return '/proxy?url=' + encoded;
    }
  });
  
  
  // A list of API routes.
  //
  // * url         (the URL, in Backbone's simple router syntax)
  // * description (a 1-2 sentence explanation of what the URL is for)
  // * section     (the name of the section it should be organized underneath
  //                in the navigation)
  //
  // * initialParams (for routes that specify params in the URL, these will
  //                  be the "example" values filled in when a user chooses
  //                  this route from the menu)
  // * extraParams   (for routes that have optional params, these will be
  //                  listed in the parameter table, but will initially be
  //                  blank)
  Explorer.Endpoints = [
    {
      url: '/api/v1/playlists',
      description: 'Retrive a list of all playlists in the library.',
      section: "Videos and Playlists"
    },
    
    {
      url: '/api/v1/playlists/:playlist_title/videos',
      description: 'Retrieve a list of all videos in the playlist identified by `playlist_title`.',
      section: "Videos and Playlists",
      
      initialParams: {
        playlist_title: "Calculus"
      }
    },
    

    {
      url: '/api/v1/playlists/:playlist_title/exercises',
      description: 'Retrive a list of all playlists in the library.',
      section: "Videos and Playlists",
      
      initialParams: {
        playlist_title: "Calculus"
      }
    },
    
    {
      url: '/api/v1/playlists/library',
      description: 'Retrieve hierarchical organization of all playlists in the library, along with all videos. This represents the entire Khan Academy video library.',
      section: "Videos and Playlists"
    },
    
    {
      url: '/api/v1/playlists/library/list',
      description: 'Retrieve flat list of all playlists in the library, along with all videos. This represents the entire Khan Academy video library.',
      section: "Videos and Playlists"
    },
    
    {
      url: '/api/v1/videos/:youtube_id',
      description: "Retrieve the video identified by `youtube_id`.",
      section: "Videos and Playlists",
      
      initialParams: {
        youtube_id: 'jxA8MffVmPs'
      }
    },
    
    {
      url: '/api/v1/videos/:youtube_id/exercises',
      description: "Retrieve a list of all exercises associated with the video identified by `youtube_id`.",
      section: "Videos and Playlists",
      
      initialParams: {
        youtube_id: 'jxA8MffVmPs'
      }
    },
    
    {
      url: '/api/v1/exercises',
      description: "Retrieve a list of all exercises in the library.",
      section: "Exercises"
    },
    
    {
      url: '/api/v1/exercises/:exercise_name',
      description: "Retrieve the exercise identified by `exercise_name`.",
      section: "Exercises",
      
      initialParams: {
        exercise_name: "logarithms_1"
      }
    },
    
    {
      url: '/api/v1/exercises/:exercise_name/followup_exercises',
      description: "Retrieve an array of all the exercises that list `exercise_name` as a prerequisite.",
      section: "Exercises",
      
      initialParams: {
        exercise_name: "subtraction_1"
      }
    },
    
    {
      url: '/api/v1/exercises/:exercise_name/videos',
      description: "Retrieve an array of all the videos associated with the exercise identified by `exercise_name`.",
      section: "Exercises",
      
      initialParams: {
        exercise_name: "logarithms_1"
      }
    },
    
    {
      url: '/api/v1/badges',
      description: "Retrieve a list of all badges.",
      section: "Badges",
      
      extraParams: ['email']
      
    },
    
    {
      url: '/api/v1/badges/categories',
      description: "Retrieve a list of all badge categories, which are referenced in the results of both `/api/v1/badges` and `/api/v1/user`.",
      section: "Badges"
    },
    
    {
      url: '/api/v1/badges/categories/:category',
      description: "Retrieve a specific badge category identified by `category`.",
      section: "Badges",
      
      initialParams: {
        category: '1'
      }
    },
    
    {
      url: '/api/v1/user',
      description: "Retrieve user data about the currently-logged-in user or the user identified by the `email` parameter.",
      section: "Users and User Data",
      
      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/videos',
      description: "Retrieve list of UserVideo objects representing all videos watched by a specific user.",
      section: "Users and User Data",
      
      extraParams: ['email', 'dt_start', 'dt_end']
    },
    
    {
      url: '/api/v1/user/videos/:youtube_id',
      description: "Retrieve UserVideo object representing a specific video, identified by `youtube_id`, watched by a specific user. Includes information about the amount of video watched, points received, and more.",
      section: "Users and User Data",
      
      initialParams: {
        youtube_id: "Sc0e6xrRJYY"
      },

      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/playlists',
      description: "Retrieve list of UserPlaylist objects representing all playlists watched by a specific user. Includes information about the total number of seconds watched in each playlist, the last time each playlist was watched, and more.",
      section: "Users and User Data",

      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/playlists/:playlist_title',
      description: "Retrieve UserPlaylist object representing a specific playlist, identified by `playlist_title`, watched by a specific user. Includes information about the total number of seconds watched in each playlist, the last time each playlist was watched, and more.",
      section: "Users and User Data",
      
      initialParams: {
        playlist_title: "Algebra"
      },

      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/videos/:youtube_id/log',
      description: "Retrieve list of VideoLog entities representing a user's logs of each session of watching a particular video, identified by `youtube_id`. Includes information about when the log of watching a video was started, how long the session lasted, how many points were earned, and more.",
      section: "Users and User Data",
      
      initialParams: {
        youtube_id: 'wD15pD5pCt4'
      },

      extraParams: ['email', 'dt_start', 'dt_end']
    },
    
    {
      url: '/api/v1/user/exercises',
      description: "Retrieve list of UserExercise objects representing all exercises engaged by a specific user. Includes information about the number of problems attempted, current streak, longest streak, and more.",
      section: "User Exercise History",

      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/exercises/:exercise_name',
      description: "Retrieve UserExercise object representing a specific exercise, identified by `exercise_name`, engaged by a specific user. Includes information about the number of problems attempted, current streak, longest streak, and more.",
      section: "User Exercise History",

      initialParams: {
        exercise_name: "scientific_notation"
      },
      
      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/exercises/:exercise_name/followup_exercises',
      description: "Retrieve an array of UserExercise objects for all exercises that list <exercise_name> as a prerequisite. Includes information about the number of problems attempted, current streak, longest streak, and more.",
      section: "User Exercise History",
      
      extraParams: ['email']
    },
    
    {
      url: '/api/v1/user/exercises/:exercise_name/log',
      description: "Retrieve list of ProblemLog entities representing a user's logs of each problem done for a particular exercise, identified by `exercise_name`. Includes information about when the problem was done, if the answer was correct, if a hint was used, how long the student took to answer the problem, and more.",
      section: "User Exercise History",
      
      extraParams: ['email', 'dt_start', 'dt_end']
    }
  ];
  
  Explorer.Router = Backbone.Router.extend({
    // Here we add all the stuff that's specified in `Explorer.Endpoints`
    // as routes for the app.
    initialize: function() {
      var endpoints = Explorer.Endpoints;
      
      // Build an index so we can retrieve the endpoint by URL.
      this.index = {};
      
      // Add the catch-all for when the route isn't found. (We add it first
      // so that it's the lowest-priority route.)
      this.route('*path', 'None', function() {
        // TODO: Figure out how we should handle API URLs we don't recognize.
        // Right now we're passing them through to the server, but there are
        // arguments against doing so.
        this.respond(null, null);
      }.bind(this));
      
      for (var i = 0, endpoint, url; endpoint = endpoints[i]; i++) {
        url = endpoint.url;
        this.index[url] = endpoint;
        
        // Add two routes: one for the ordinary URL and one for when there's
        // a trailing query string. This is a bit silly, but it's easier to
        // work around the quirks of the Backbone router than to handle
        // routing manually.
        this.route(url, url, this._makeResponder(endpoint));
        this.route(url + '?:query_string', url, this._makeResponder(endpoint));
      }
    },
    
    respond: function(endpoint, params) {
      // The fragment can be passed directly to the API explorer.
      var fragment = Backbone.history.fragment;
      var object   = params ? this._paramsToObject(params, endpoint) : null;
      this._addQueryStringParams(object, fragment);
      
      api.request(fragment);
      api.set({ endpoint: endpoint, params: object });
    },
    
    // Takes an array of URL parameter values and matches them up with their
    // parameter names. Far more useful this way.
    _paramsToObject: function(params, endpoint) {
      if (params.length === 0) return {};
      var names = endpoint.url.match(/:\w+/g);
      var object = {};
      if (!names) return object;
      for (var i = 0, len = names.length, name; i < len; i++) {
        name = names[i].substring(1);
        object[name] = decodeURIComponent(params[i]);
      }
      
      return object;
    },
    
    // Looks at the manually-specified parameters in the query string
    // and adds them to the `params` object.
    _addQueryStringParams: function(params, fragment) {
      var queryString = fragment.split('?')[1];
      if (!queryString) return;
      
      var pairs = queryString.split('&');
      _.each(pairs, function(whole) {
        var pair = whole.split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      });
      
      return params;
    },
    
    // Given an endpoint and an object of parameters, produces the
    // corresponding URL for an API request.
    interpolate: function(endpoint, params) {
      var url = endpoint.url;
      
      for (var name in params) {
        if (url.indexOf(':' + name) > -1) {
          url = url.replace(':' + name, encodeURIComponent(params[name]));
          delete params[name];
        }
      }
      
      // We've handled all the params that are part of the URL, so anything
      // that's left over ends up in a query string.
      var queryStringParts = [];
      for (name in params) {
        if (!params[name] || params[name] === '') continue;
        queryStringParts.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
      }
      
      if (queryStringParts.length > 0) {
        url += ('?' + queryStringParts.join('&'));
      }

      return url;
    },
    
    _makeResponder: function(endpoint) {
      return function() {
        var args = _.toArray(arguments);
        this.respond.call(this, endpoint, args);
      };
    }
    
  });
  
  
  
  Explorer.ApplicationView = Backbone.View.extend({
    el: $('#explorer'),
    
    STATUS_MESSAGES: {
      uninitialized: '',
      pending: '<i class="icon-time icon-white"></i> Requesting...',
      done: '<i class="icon-ok icon-white"></i> Done.',
      error: '<i class="icon-exclamation-sign icon-white"></i> Error.'
    },
    
    initialize: function() {
      this.field           = $('#url');
      this.urlForm         = this.field.closest('form');
      this.paramsForm      = $('#description')
      this.responseBody    = $('#response_body');
      this.responseHeaders = $('#response_headers');
      this.status          = $('#status');
      
      this.model.bind('change', this.render, this);
      
      this.urlForm.submit(this._changeUrl.bind(this));
      this.paramsForm.submit(this._changeParams.bind(this));
      
      this.paramsForm.delegate('input:text', 'keydown', function(event) {
        if (event.keyCode !== 13) return; // ENTER key
        event.preventDefault();
        this.paramsForm.submit();
      }.bind(this));
      
      this._renderEndpointsList();
    },
    
    _renderEndpointDescription: function(endpoint, params) {
      
      function tableRowForParamName(name, value, isOptional) {
        var label = "";
        if (isOptional) {
          label = " <span class='label'>optional</span>"
        }
        // Catch both null and undefined here.
        if (value == null) value = '';
        var row = $("<tr><th></th><td><input type='text'/></td></tr>")
            .find("th").text(name).append(label).end()
            .find("input").attr({name: name, value: value}).end()
            .get(0).outerHTML;
        
        return row;
      }
      
      function isOptionalParam(name, endpoint) {
        if (!endpoint.extraParams) return false;
        return $.inArray(name, endpoint.extraParams) > -1;
      }
      
      var form = this.paramsForm, table = form.find('#parameters_table');
      
      // Simple replacement of backticks with `<code>`.
      // TODO: Other formatting might be needed later — or we might just do
      // it as a compile step in another layer.
      var description = endpoint.description;
      description = description.replace(/`(.*?)`/g, '<code>$1</code>');
      
      form.find('#action_container').html(description);
      
      var rows = [], row, rowName, isOptional;
      // All _specified_ params, both required and optional.
      for (var name in params) {
        isOptional = isOptionalParam(name, endpoint);
        rows.push(tableRowForParamName(name, params[name], isOptional));
      }
      
      // Loop through optional params and catch the ones that weren't
      // specified.
      _.each(endpoint.extraParams, function(extraParamName) {
        // Skip if it was provided.
        if (params[extraParamName]) return;
        
        rows.push(tableRowForParamName(extraParamName, null, true));
      });
      
      
      if (rows.length === 0) {
        table.hide();
        return;
      }

      table.find('tbody').html(rows.join('\n'));
      table.show();
    },
    
    // Called when the user changes the URL in the address bar and then 
    // submits the form.
    _changeUrl: function(event) {
      event.preventDefault();

      var url = this.field.val();

      // Chop off any trailing slash. (Preserving a query string, if it
      // exists.)
      url = url.replace(/\/(?=$|\?.*?)/, '');
      url = encodeURIComponent(url);

      // Set whatever is in the text field as the URL fragment. The router
      // will take care of the rest.
      router.navigate(url, true);
    },
    
    // Called when the user changes one of the parameters in the table and
    // then submits the form.
    _changeParams: function(event) {
      event.preventDefault();
      
      // Build a name/value object of parameters.
      var array = this.paramsForm.serializeArray(), obj = {};
      for (var i = 0, item; item = array[i]; i++) {
        obj[item.name] = item.value;
      }
      
      // Interpolate the collected parameters into the URL pattern to get our
      // new URL. Then navigate there.
      var endpoint = this.model.get('endpoint');
      var newUrl   = router.interpolate(endpoint, obj);
      router.navigate(encodeURIComponent(newUrl), true);
    },
    
    // Called whenever the URL or the response changes.
    render: function() {
      var url   = this.model.get('url'),
       response = this.model.get('response'),
       state    = this.model.get('state'),
       endpoint = this.model.get('endpoint');
       
      this._setActiveEndpointInMenu(endpoint);
      
      if (state === 'pending') {
        // A new URL has been requested. Clear out the old contents.
        this.setResponse('');
        this.field.val(url);
      } else if (state === 'done' || state === 'error') {
        // We should have a response.
        this.setResponse(response);
      }
    },
    
    // Handles setting (and animating) the response, headers, and status.
    setResponse: function(response) {
      function shouldHighlightResponse(response) {
        // Check if the highlighter script is loaded.
        if (!window.Fluorescence) return false;

        // Don't try to highlight really long JSON responses. Beachballs like
        // crazy.
        if (response.length > 50000) return false;

        // We want to prevent HTTP error responses (which are HTML) from
        // being highlighted. We could look at the Content-Type of the 
        // response, but let's be lazy and just look for something HTML-ish.
        if (response.indexOf("!DOCTYPE HTML") > -1) return false;

        return true;
      }
      
      var pane = $('#response_pane'),
       status  = $('#status'),
       body    = this.responseBody,
       head    = this.responseHeaders;
      
      var state = this.model.get('state'),
       message = this.STATUS_MESSAGES[state];
       
      var headers = this.model.get('headers');
       
      if (state !== 'done' && state !== 'error') {
        pane.animate({ maxHeight: status.outerHeight() }, { 
          duration: 400,
          complete: function() {
            body.html(response);
            head.html(headers);
            this.status.html(message);
          }.bind(this)
        });
      } else {
        // Ridiculous hack so that I can update the response body in a way 
        // that takes the animation queue into consideration. We don't want
        // this firing before the slideup animation clears out the response
        // body element.
        pane.animate({ maxHeight: status.outerHeight() }, {
          duration: 10,
          complete: function() {
            body.html(response);
            head.html(headers);

            if (shouldHighlightResponse(response)) {
              try {
                Fluorescence.highlight();
              } catch(e) {
                console.error(e);
              }
            }
          }
        });
        
        // Now that the new content is in place, we can kick off the
        // slide-down animation.
        pane.animate({ maxHeight: $(window).height() }, {
          duration: 400,
          complete: function() {
            this.status.html(message);
          }.bind(this)
        });
      }
    },
    
    // Populates the list in the sidebar with all the registered routes.
    _renderEndpointsList: function() {
      function sectionNameForEndpoint(endpoint) {
        return endpoint.section ? endpoint.section : '*';
      }
      
      function elementForEndpoint(endpoint) {
        var exampleUrl;
        if (endpoint.initialParams) {
          exampleUrl = router.interpolate(endpoint, endpoint.initialParams);
        } else {
          exampleUrl = endpoint.url;
        }
        
        return $(
          "<li>\n" + 
          "  <a href='#" + exampleUrl + "'>" + endpoint.url + "</a>\n" +
          "</li>\n"
        );
      }
      
      function elementForSection(name) {
        var element = $("<li class='nav-header'></li>");
        element.text(name);
        return element;
      }
      
      var endpoints = Explorer.Endpoints;
      var sections = { '*': [] }, sectionsOrder = ['*'];
      
      _.each(endpoints, function(endpoint) {
        // For each endpoint, figure out what section it's going into, then
        // create an element and add it to the group of elements for that
        // section.
        //
        // Sections are created on-demand (if necessary) when named by an
        // endpoint.
        var section = sectionNameForEndpoint(endpoint), group;
        if (!sections[section]) {
          sections[section] = group = [];
          sectionsOrder.push(section);
        } else {
          group = sections[section];
        }
        
        var element = elementForEndpoint(endpoint);
        endpoint._element = element;
        element.data('endpoint', endpoint);
        
        group.push(element);
      });
      
      
      var list = $('#routes_list');
      _.each(sectionsOrder, function(name) {
        // We loop through the sections in the order we created them.
        var section = sections[name];
        
        // The '*' section is the catch-all for endpoints without a section.
        // They're rendered above all others _without_ a section header.
        if (name !== '*')
          list.append(elementForSection(name));
        
        for (var i = 0, element; element = section[i]; i++)
          list.append(element);
      });
    },
    
    // Renders the necessary views for the active endpoint.
    _setActiveEndpointInMenu: function(endpoint) {
      $('#routes_list li').removeClass('active');
      if (!endpoint) return;

      var params = this.model.get('params');
      this._renderEndpointDescription(endpoint, params);
      
      if (endpoint._element)
        endpoint._element.addClass('active');
        
      this._scrollToActiveEndpointInMenu();
    },
    
    // Ensures the route list is properly scrolled to show the active menu
    // item.
    _scrollToActiveEndpointInMenu: function() {
      var list = $('#routes_list'), active = list.find('li.active');
      if (!active.length) return;
      
      var height = list.innerHeight(), scrollTop = list.prop('scrollTop'),
       offset = active.prop('offsetTop');
      
      if (offset > scrollTop && offset < (scrollTop + height)) {
        // The list item is in view.
        return;
      } else {
        // Adjust the scrollTop so that it's in view.
        list.prop('scrollTop', offset);
      }
    }
  });
  
  window.api = new Explorer.API({
    url: '',
    headers: '',
    response: '',
    state: 'uninitialized'
  });
  
  window.router   = new Explorer.Router;
  window.app      = new Explorer.ApplicationView({ model: window.api });

  window.Explorer = Explorer;
  
  // This needs to happen _after_ all the routes are created!
  Backbone.history.start();
  
  window.setTimeout(function() {
    // If there's no URL set, pick the first route.
    if (api.get('url') === '') {
      var endpoint = Explorer.Endpoints[0];
      router.navigate(endpoint.url, { trigger: true });
    }
  }, 200);
})(jQuery);
