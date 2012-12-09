
(function() {

  function klass(value) {
    return Object.prototype.toString.apply(value);
  }

  // Quick way to tell the various types apart.
  function typeOf(value) {
    var t = typeof value;
    if (t === 'object') {
      if (value === null) return 'null';
      var k = klass(value);

      if (k === '[object Array]')  return 'array';
      if (k === '[object Date]')   return 'date';
      if (k === '[object RegExp]') return 'regex';

      return 'object';
    }
    return t;
  }

  function escapeHTML(html) {
    return html.replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/\"/g, '\\"')
      .replace(/\n/g, '\\\\n');
  }

  function beautifyJSON(data, indent) {
    if (typeof indent !== 'string') indent = '';

    var indentStyle = '  ';
    var type = typeOf(data);

    var html = '', isArray = (type === 'array');

    if (isArray) {
      // We're dealing with an array.
      if (data.length === 0) return '[]';
      html += '[';
    } else {
      // We're dealing with an object.

      // Count all the enumerable properties of the object, skipping any
      // functions.
      var c = 0, t;
      for (var i in data) {
        t = typeOf(data[i]);
        if (type !== 'function') c++;
      }

      // If there are none, it's an empty object.
      if (c === 0) return '{}';

      html += '{';
    }

    var count = 0, value;

    for (var key in data) {
      value = data[key];
      if (typeOf(value) === 'function') continue;

      if (count > 0) html += ',';

      if (isArray) {
        // Add an indented newline.
        html += ('\n' + indent + indentStyle);
      } else {
        // Add an indented newline with the property name.
        html += ('\n' + indent + indentStyle +
         '"' + key + '"' + ': ');
      }


      switch (typeOf(value)) {
        case 'array': // fallthrough
        case 'object':
          html += beautifyJSON(value, indent + indentStyle);
          break;
        case 'boolean': // fallthrough
        case 'number':
          html += value.toString();
          break;
        case 'null':
          html += 'null';
          break;
        case 'string':
          html += ('"' + escapeHTML(value) + '"');
          break;
        default:
          // Debug.
      }

      count++;

    }

    // We've iterated through all the properties.
    html += ('\n' + indent + (isArray ? ']' : '}'));

    return html;
  }


  window.PrettyJSON = {
    stringify: function(object) {
      return beautifyJSON(object);
    }
  }
})();
