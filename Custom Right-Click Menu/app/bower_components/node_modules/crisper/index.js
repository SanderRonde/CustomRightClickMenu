/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// jshint node: true
'use strict';

var dom5 = require('dom5');
var pred = dom5.predicates;

var inlineScriptFinder = pred.AND(
  pred.hasTagName('script'),
  pred.OR(
    pred.NOT(
      pred.hasAttr('type')
    ),
    pred.hasAttrValue('type', 'application/javascript')
  ),
  pred.NOT(
    pred.hasAttr('src')
  )
);

function split(source, jsFileName) {
  var doc = dom5.parse(source);
  var head = dom5.query(doc, pred.hasTagName('head'));
  var body = dom5.query(doc, pred.hasTagName('body'));
  var scripts = dom5.queryAll(doc, inlineScriptFinder);

  var contents = [];
  scripts.forEach(function(sn) {
    var nidx = sn.parentNode.childNodes.indexOf(sn) + 1;
    var next = sn.parentNode.childNodes[nidx];
    dom5.remove(sn);
    // remove newline after script to get rid of nasty whitespace
    if (next && dom5.isTextNode(next) && !/\S/.test(dom5.getTextContent(next))) {
      dom5.remove(next);
    }
    contents.push(dom5.getTextContent(sn));
  });

  var newScript = dom5.constructors.element('script');
  dom5.setAttribute(newScript, 'src', jsFileName);
  dom5.append(body, newScript);

  var html = dom5.serialize(doc);
  // newline + semicolon should be enough to capture all cases of concat
  var js = contents.join('\n;');

  return {
    html: html,
    js: js
  };
}

module.exports = {
  split: split
};
