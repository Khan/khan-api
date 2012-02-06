

(function($) {
  
  function Template(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  }
  
  function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
  }
  
  function interpret(string) {
    return string == null ? '' : string;
  }
  
  function escapeRegExp(str) {
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }
  
  $.extend(Template.prototype, {
    evaluate: function evaluate(object) {
      if (object && typeof object.toTemplateReplacements === 'function')
        object = object.toTemplateReplacements();
        
      return this.template.replace(this.pattern, function(m0, m1, m2, m3) {
        //var match = arguments;
        if (object == null) return (m1 + '');
        
        var before = m1 || '';
        if (before == '\\') return m2;
        
        var ctx = object, expr = m3,
         pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
        
        match = pattern.exec(expr);
        if (match == null) return before;
        
        while (match != null) {
          var comp = match[1].indexOf('[') === 0 ?
           match[2].replace(/\\\\]/g, ']') :
           match[1];
          ctx = ctx[comp];
          
          if (null == ctx || '' == match[3]) break;
          expr = expr.substring('[' == match[3] ? 
           match[1].length : match[0].length);
          match = pattern.exec(expr);
        }
        
        return before + interpret(ctx);
      });
    }
  });
  
  Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/g;
    
  var DEFAULT_TEMPLATE = new Template(
   '<span class=\'#{className}\'>#{text}</span>');
   
  function Language(name, rules, options) {
    this.name = name;
    this.rules = this._makeRules(rules);
    
    var defaults = $.extend({}, Language.DEFAULT_OPTIONS);
    this.options = $.extend(defaults, options || {});
    
    this.elements = [];
    var patterns = [];
    for (var i = 0, rule; rule = this.rules[i]; i++)
      patterns.push(rule.pattern);
      
    this.pattern = new RegExp(patterns.join('|'),
     this.options.ignoreCase ? 'gi' : 'g');
  }
  
  $.extend(Language.prototype, {
    _makeRules: function _makeRules(rules) {
      var newRules = [];
      for (var ruleName in rules)
        newRules.push(new Rule(ruleName, rules[ruleName]));
      return newRules;
    },
    
    addElement: function addElement(element) {
      if ($.inArray(element, this.elements) === -1)
        this.elements.push(element);
    },
    
    highlight: function highlight() {
      for (var i = 0, element, parsed; i < this.elements.length; i++) {
        element = $(this.elements[i]);
        // TODO: Handle IE.
        parsed = this.parse(element[0].innerHTML);
        element[0].innerHTML = parsed;
      }
    },
    
    parse: function parse(text) {
      if (!text || text === '') return '';
      var matches = this.pattern.exec(text);
      var that = this;
      var parsed = text.replace(this.pattern, function() {
        var i = 0, j = 1, rule, replacements;
        var length = matches.length;
        while (rule = that.rules[i++]) {
          if (!arguments[j] || arguments[j] === '') {
            j += rule.length;
            continue;
          }
          
          if (!rule.replacement) {
            return DEFAULT_TEMPLATE.evaluate({
              className: rule.name, text: arguments[0]
            });
          } else {
            replacements = [rule.name];
            for (var k = 1; k <= rule.length; k++)
              replacements.push(arguments[j + k]);
            
            return new Template(rule.replacement).evaluate(replacements);
          }
        }
      });
      
      return parsed;
    },
    
    _fixIE: function() {
      // TODO
    }
  });
  
  
  $.extend(Language, {
    _instances: [],
    
    DEFAULT_OPTIONS: {
      ignoreCase: false
    },
    
    add: function add(instance) {
      this._instances.push(instance);
    },
    
    remove: function remove(instance) {
      var index = $.inArray(instance, this._instances);
      if (index === -1) return;
      this._instances.splice(index, 1);
    },
    
    each: function each(iterator) {
      for (var i = 0, instance; instance = this._instances[i]; i++)
        iterator(instance);
    },
    
    size: function size() {
      return this._instances.length;
    }
  });
  
  
  // Private class.
  function Rule(name, rule) {
    this.name = name;
    $.extend(this, rule);
    
    if (typeof rule.pattern !== 'string') {
      this.pattern = rule.pattern.toString().substr(1,
       String(rule.pattern).length - 2);
    } else {
      this.pattern = rule.pattern;
    }
    
    this.length = (this.pattern.match(/(^|[^\\])\([^?]/g) || "").length + 1;
    this.pattern = '(' + this.pattern + ')';
  }
  
  function setup() {
    var elements = $('code');
    
    elements.each( function(i, element) {
      if ($(element).attr('class') === '') return;
      
      Language.each( function(set) {
        if ($(element).hasClass(set.name))
          set.addElement(element);
      });
    });
    
    Language.each(function(language) { language.highlight(); });
    
  }
  
  
  window.Fluorescence = {
    TAB_SIZE: 2,
    addLanguage: function addLanguage(name, rules, options) {
      Language.add(new Language(name, rules, options));
      if (Language.size() === 1) $(document).ready(setup);
    },
    
    highlight: function highlight() {
      setup();
    }
  };
  

})(jQuery);