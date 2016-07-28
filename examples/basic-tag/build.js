/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var oval = __webpack_require__(1);
	oval.init();
	__webpack_require__(8);
	oval.mountAll('*', document);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  updateElement: __webpack_require__(2),
	  createElement: __webpack_require__(5),
	  registeredTags: [],
	  init: function (plasma) {
	    this.plasma = __webpack_require__(6)(plasma)
	    this.BaseTag = __webpack_require__(7)(this)
	  },
	  getRegisteredTag: function (name) {
	    for (var i = 0; i < this.registeredTags.length; i++) {
	      if (this.registeredTags[i].tagName === name.toLowerCase()) {
	        return this.registeredTags[i].Tag
	      }
	    }
	  },
	  mountAll: function (selector, root) {
	    if (!selector || !root) throw new Error(arguments + ' supplied should have selector and root')
	    var elements = []
	    if (selector === '*') {
	      for (var i = 0; i < this.registeredTags.length; i++) {
	        var els = root.querySelectorAll(this.registeredTags[i].tagName)
	        if (els.length) {
	          for (var k = 0; k < els.length; k++) {
	            elements.push(els[k])
	          }
	        }
	      }
	    } else {
	      elements = root.querySelectorAll(selector)
	    }
	    var tags = []
	    for (var i = 0; i < elements.length; i++) {
	      if (elements[i].oval_tag) {
	        elements[i].oval_tag.update()
	        tags.push(elements[i].oval_tag)
	        continue
	      }
	      var name = elements[i].tagName
	      var Tag = this.getRegisteredTag(name)
	      var instance = new Tag(name, elements[i])
	      instance.update()
	      tags.push(instance)
	    }
	    return tags
	  },
	  mountAt: function (el, tagName) {
	    if (!el || !tagName) throw new Error(arguments + ' supplied should have el and tagName')
	    if (el.oval_tag) {
	      el.oval_tag.update()
	      return el.oval_tag
	    }
	    var Tag = this.getRegisteredTag(tagName)
	    var instance = new Tag(tagName, el)
	    instance.update()
	    return instance
	  },
	  appendAt: function (el, tagName) {
	    if (!el || !tagName) throw new Error(arguments + ' supplied should have el and tagName')
	    var Tag = this.getRegisteredTag(tagName)
	    var instance = new Tag(tagName, document.createElement(tagName))
	    instance.update()
	    el.appendChild(instance.root)
	    return instance
	  },
	  registerTag: function (tagName, TagClass) {
	    if (this.getRegisteredTag(tagName)) throw new Error(tagName + ' already registered')
	    this.registeredTags.push({
	      tagName: tagName,
	      Tag: TagClass
	    })
	  }
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var morphdom = __webpack_require__(3) // efficiently diffs + morphs two DOM elements
	var defaultEvents = __webpack_require__(4) // default events to be copied when dom elements update

	module.exports = function updateElement (node, nodeTemplate, opts) {
	  if (!opts) opts = {}
	  if (opts.events !== false) {
	    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
	  }

	  return morphdom(node, nodeTemplate, opts)

	  // morphdom only copies attributes. we decided we also wanted to copy events
	  // that can be set via attributes
	  function copier (f, t) {
	    if (f.oval_tag && f.oval_tag.shouldRender && !f.oval_tag.shouldRender()) {
	      return false
	    }

	    // copy events:
	    var events = opts.events || defaultEvents
	    for (var i = 0; i < events.length; i++) {
	      var ev = events[i]
	      if (t[ev]) { // if new element has a whitelisted attribute
	        f[ev] = t[ev] // update existing element
	      } else if (f[ev]) { // if existing element has it and new one doesnt
	        f[ev] = undefined // remove it from existing element
	      }
	    }

	    // copy values for form elements
	    if (f.nodeName === 'INPUT' || f.nodeName === 'TEXTAREA' || f.nodeName === 'SELECT') {
	      if (t.getAttribute('value') === null) t.value = f.value
	    }
	    // copy custom properties
	    if (t.customProperties) {
	      f.customProperties = t.customProperties
	    }
	  }
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	// Create a range object for efficently rendering strings to elements.
	var range;

	var testEl = (typeof document !== 'undefined') ?
	    document.body || document.createElement('div') :
	    {};

	var XHTML = 'http://www.w3.org/1999/xhtml';
	var ELEMENT_NODE = 1;
	var TEXT_NODE = 3;
	var COMMENT_NODE = 8;

	// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
	// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
	var hasAttributeNS;

	if (testEl.hasAttributeNS) {
	    hasAttributeNS = function(el, namespaceURI, name) {
	        return el.hasAttributeNS(namespaceURI, name);
	    };
	} else if (testEl.hasAttribute) {
	    hasAttributeNS = function(el, namespaceURI, name) {
	        return el.hasAttribute(name);
	    };
	} else {
	    hasAttributeNS = function(el, namespaceURI, name) {
	        return !!el.getAttributeNode(name);
	    };
	}

	function toElement(str) {
	    if (!range && document.createRange) {
	        range = document.createRange();
	        range.selectNode(document.body);
	    }

	    var fragment;
	    if (range && range.createContextualFragment) {
	        fragment = range.createContextualFragment(str);
	    } else {
	        fragment = document.createElement('body');
	        fragment.innerHTML = str;
	    }
	    return fragment.childNodes[0];
	}

	var specialElHandlers = {
	    /**
	     * Needed for IE. Apparently IE doesn't think that "selected" is an
	     * attribute when reading over the attributes using selectEl.attributes
	     */
	    OPTION: function(fromEl, toEl) {
	        fromEl.selected = toEl.selected;
	        if (fromEl.selected) {
	            fromEl.setAttribute('selected', '');
	        } else {
	            fromEl.removeAttribute('selected', '');
	        }
	    },
	    /**
	     * The "value" attribute is special for the <input> element since it sets
	     * the initial value. Changing the "value" attribute without changing the
	     * "value" property will have no effect since it is only used to the set the
	     * initial value.  Similar for the "checked" attribute, and "disabled".
	     */
	    INPUT: function(fromEl, toEl) {
	        fromEl.checked = toEl.checked;
	        if (fromEl.checked) {
	            fromEl.setAttribute('checked', '');
	        } else {
	            fromEl.removeAttribute('checked');
	        }

	        if (fromEl.value !== toEl.value) {
	            fromEl.value = toEl.value;
	        }

	        if (!hasAttributeNS(toEl, null, 'value')) {
	            fromEl.removeAttribute('value');
	        }

	        fromEl.disabled = toEl.disabled;
	        if (fromEl.disabled) {
	            fromEl.setAttribute('disabled', '');
	        } else {
	            fromEl.removeAttribute('disabled');
	        }
	    },

	    TEXTAREA: function(fromEl, toEl) {
	        var newValue = toEl.value;
	        if (fromEl.value !== newValue) {
	            fromEl.value = newValue;
	        }

	        if (fromEl.firstChild) {
	            fromEl.firstChild.nodeValue = newValue;
	        }
	    }
	};

	function noop() {}

	/**
	 * Returns true if two node's names and namespace URIs are the same.
	 *
	 * @param {Element} a
	 * @param {Element} b
	 * @return {boolean}
	 */
	var compareNodeNames = function(a, b) {
	    return a.nodeName === b.nodeName &&
	           a.namespaceURI === b.namespaceURI;
	};

	/**
	 * Create an element, optionally with a known namespace URI.
	 *
	 * @param {string} name the element name, e.g. 'div' or 'svg'
	 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
	 * its `xmlns` attribute or its inferred namespace.
	 *
	 * @return {Element}
	 */
	function createElementNS(name, namespaceURI) {
	    return !namespaceURI || namespaceURI === XHTML ?
	        document.createElement(name) :
	        document.createElementNS(namespaceURI, name);
	}

	/**
	 * Loop over all of the attributes on the target node and make sure the original
	 * DOM node has the same attributes. If an attribute found on the original node
	 * is not on the new node then remove it from the original node.
	 *
	 * @param  {Element} fromNode
	 * @param  {Element} toNode
	 */
	function morphAttrs(fromNode, toNode) {
	    var attrs = toNode.attributes;
	    var i;
	    var attr;
	    var attrName;
	    var attrNamespaceURI;
	    var attrValue;
	    var fromValue;

	    for (i = attrs.length - 1; i >= 0; --i) {
	        attr = attrs[i];
	        attrName = attr.name;
	        attrNamespaceURI = attr.namespaceURI;
	        attrValue = attr.value;

	        if (attrNamespaceURI) {
	            attrName = attr.localName || attrName;
	            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

	            if (fromValue !== attrValue) {
	                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
	            }
	        } else {
	            fromValue = fromNode.getAttribute(attrName);

	            if (fromValue !== attrValue) {
	                fromNode.setAttribute(attrName, attrValue);
	            }
	        }
	    }

	    // Remove any extra attributes found on the original DOM element that
	    // weren't found on the target element.
	    attrs = fromNode.attributes;

	    for (i = attrs.length - 1; i >= 0; --i) {
	        attr = attrs[i];
	        if (attr.specified !== false) {
	            attrName = attr.name;
	            attrNamespaceURI = attr.namespaceURI;

	            if (attrNamespaceURI) {
	                attrName = attrName = attr.localName || attrName;

	                if (!hasAttributeNS(toNode, attrNamespaceURI, attrName)) {
	                    fromNode.removeAttributeNS(attrNamespaceURI, attr.localName);
	                }
	            } else {
	                if (!hasAttributeNS(toNode, null, attrName)) {
	                    fromNode.removeAttribute(attrName);
	                }
	            }
	        }
	    }
	}

	/**
	 * Copies the children of one DOM element to another DOM element
	 */
	function moveChildren(fromEl, toEl) {
	    var curChild = fromEl.firstChild;
	    while (curChild) {
	        var nextChild = curChild.nextSibling;
	        toEl.appendChild(curChild);
	        curChild = nextChild;
	    }
	    return toEl;
	}

	function defaultGetNodeKey(node) {
	    return node.id;
	}

	function morphdom(fromNode, toNode, options) {
	    if (!options) {
	        options = {};
	    }

	    if (typeof toNode === 'string') {
	        if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
	            var toNodeHtml = toNode;
	            toNode = document.createElement('html');
	            toNode.innerHTML = toNodeHtml;
	        } else {
	            toNode = toElement(toNode);
	        }
	    }

	    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
	    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
	    var onNodeAdded = options.onNodeAdded || noop;
	    var onBeforeElUpdated = options.onBeforeElUpdated || noop;
	    var onElUpdated = options.onElUpdated || noop;
	    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
	    var onNodeDiscarded = options.onNodeDiscarded || noop;
	    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
	    var childrenOnly = options.childrenOnly === true;

	    // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
	    var fromNodesLookup = {};

	    function walkDiscardedChildNodes(node) {
	        if (node.nodeType === ELEMENT_NODE) {
	            var curChild = node.firstChild;
	            while (curChild) {
	                if (!getNodeKey(curChild)) {
	                    // Only report the node as discarded if it is not keyed. We do this because
	                    // at the end we loop through all keyed elements that were unmatched
	                    // and then discard them in one final pass.
	                    onNodeDiscarded(curChild);
	                    if (curChild.firstChild) {
	                        walkDiscardedChildNodes(curChild);
	                    }
	                }

	                curChild = curChild.nextSibling;
	            }
	        }
	    }

	    function removeNode(node, parentNode) {
	        if (onBeforeNodeDiscarded(node) === false) {
	            return;
	        }

	        if (parentNode) {
	            parentNode.removeChild(node);
	        }

	        onNodeDiscarded(node);
	        walkDiscardedChildNodes(node);
	    }

	    // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
	    // function indexTree(root) {
	    //     var treeWalker = document.createTreeWalker(
	    //         root,
	    //         NodeFilter.SHOW_ELEMENT);
	    //
	    //     var el;
	    //     while((el = treeWalker.nextNode())) {
	    //         var key = getNodeKey(el);
	    //         if (key) {
	    //             fromNodesLookup[key] = el;
	    //         }
	    //     }
	    // }

	    // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
	    //
	    // function indexTree(node) {
	    //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
	    //     var el;
	    //     while((el = nodeIterator.nextNode())) {
	    //         var key = getNodeKey(el);
	    //         if (key) {
	    //             fromNodesLookup[key] = el;
	    //         }
	    //     }
	    // }

	    function indexTree(node) {
	        if (node.nodeType === ELEMENT_NODE) {
	            var curChild = node.firstChild;
	            while (curChild) {
	                var key = getNodeKey(curChild);
	                if (key) {
	                    fromNodesLookup[key] = curChild;
	                }

	                // Walk recursively
	                indexTree(curChild);

	                curChild = curChild.nextSibling;
	            }
	        }
	    }

	    indexTree(fromNode);

	    function handleNodeAdded(el) {
	        onNodeAdded(el);

	        var curChild = el.firstChild;
	        while (curChild) {
	            var nextSibling = curChild.nextSibling;

	            var key = getNodeKey(curChild);
	            if (key) {
	                var unmatchedFromEl = fromNodesLookup[key];
	                if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
	                    curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
	                    morphEl(unmatchedFromEl, curChild);
	                }
	            }

	            handleNodeAdded(curChild);
	            curChild = nextSibling;
	        }
	    }

	    function morphEl(fromEl, toEl, childrenOnly) {
	        var toElKey = getNodeKey(toEl);
	        if (toElKey) {
	            // If an element with an ID is being morphed then it is will be in the final
	            // DOM so clear it out of the saved elements collection
	            delete fromNodesLookup[toElKey];
	        }

	        if (!childrenOnly) {
	            if (onBeforeElUpdated(fromEl, toEl) === false) {
	                return;
	            }

	            morphAttrs(fromEl, toEl);
	            onElUpdated(fromEl);

	            if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
	                return;
	            }
	        }

	        if (fromEl.nodeName !== 'TEXTAREA') {
	            var curToNodeChild = toEl.firstChild;
	            var curFromNodeChild = fromEl.firstChild;
	            var curToNodeKey;

	            var fromNextSibling;
	            var toNextSibling;
	            var matchingFromEl;

	            outer: while (curToNodeChild) {
	                toNextSibling = curToNodeChild.nextSibling;
	                curToNodeKey = getNodeKey(curToNodeChild);

	                while (curFromNodeChild) {
	                    var curFromNodeKey = getNodeKey(curFromNodeChild);
	                    fromNextSibling = curFromNodeChild.nextSibling;

	                    var curFromNodeType = curFromNodeChild.nodeType;

	                    var isCompatible = undefined;

	                    if (curFromNodeType === curToNodeChild.nodeType) {
	                        if (curFromNodeType === ELEMENT_NODE) {
	                            // Both nodes being compared are Element nodes

	                            if (curToNodeKey) {
	                                // The target node has a key so we want to match it up with the correct element
	                                // in the original DOM tree
	                                if (curToNodeKey !== curFromNodeKey) {
	                                    // The current element in the original DOM tree does not have a matching key so
	                                    // let's check our lookup to see if there is a matching element in the original
	                                    // DOM tree
	                                    if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
	                                        if (curFromNodeChild.nextSibling === matchingFromEl) {
	                                            // Special case for single element removals. To avoid removing the original
	                                            // DOM node out of the tree (since that can break CSS transitions, etc.),
	                                            // we will instead discard the current node and wait until the next
	                                            // iteration to properly match up the keyed target element with its matching
	                                            // element in the original tree
	                                            isCompatible = false;
	                                        } else {
	                                            // We found a matching keyed element somewhere in the original DOM tree.
	                                            // Let's moving the original DOM node into the current position and morph
	                                            // it.

	                                            // NOTE: We use insertBefore instead of replaceChild because we want to go through
	                                            // the `removeNode()` function for the node that is being discarded so that
	                                            // all lifecycle hooks are correctly invoked
	                                            fromEl.insertBefore(matchingFromEl, curFromNodeChild);

	                                            if (!curFromNodeKey) {
	                                                removeNode(curFromNodeChild, fromEl);
	                                            }
	                                            fromNextSibling = curFromNodeChild.nextSibling;
	                                            curFromNodeChild = matchingFromEl;
	                                        }
	                                    } else {
	                                        // The nodes are not compatible since the "to" node has a key and there
	                                        // is no matching keyed node in the source tree
	                                        isCompatible = false;
	                                    }
	                                }
	                            } else if (curFromNodeKey) {
	                                // The original has a key
	                                isCompatible = false;
	                            }

	                            isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
	                            if (isCompatible) {
	                                // We found compatible DOM elements so transform
	                                // the current "from" node to match the current
	                                // target DOM node.
	                                morphEl(curFromNodeChild, curToNodeChild);
	                            }

	                        } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
	                            // Both nodes being compared are Text or Comment nodes
	                            isCompatible = true;
	                            // Simply update nodeValue on the original node to
	                            // change the text value
	                            curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
	                        }
	                    }

	                    if (isCompatible) {
	                        // Advance both the "to" child and the "from" child since we found a match
	                        curToNodeChild = toNextSibling;
	                        curFromNodeChild = fromNextSibling;
	                        continue outer;
	                    }

	                    // No compatible match so remove the old node from the DOM and continue trying to find a
	                    // match in the original DOM. However, we only do this if the from node is not keyed
	                    // since it is possible that a keyed node might match up with a node somewhere else in the
	                    // target tree and we don't want to discard it just yet since it still might find a
	                    // home in the final DOM tree. After everything is done we will remove any keyed nodes
	                    // that didn't find a home
	                    if (!curFromNodeKey) {
	                        removeNode(curFromNodeChild, fromEl);
	                    }

	                    curFromNodeChild = fromNextSibling;
	                }

	                // If we got this far then we did not find a candidate match for
	                // our "to node" and we exhausted all of the children "from"
	                // nodes. Therefore, we will just append the current "to" node
	                // to the end
	                if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
	                    fromEl.appendChild(matchingFromEl);
	                    morphEl(matchingFromEl, curToNodeChild);
	                } else {
	                    if (onBeforeNodeAdded(curToNodeChild) !== false) {
	                        fromEl.appendChild(curToNodeChild);
	                        handleNodeAdded(curToNodeChild);
	                    }
	                }

	                curToNodeChild = toNextSibling;
	                curFromNodeChild = fromNextSibling;
	            }

	            // We have processed all of the "to nodes". If curFromNodeChild is
	            // non-null then we still have some from nodes left over that need
	            // to be removed
	            while (curFromNodeChild) {
	                fromNextSibling = curFromNodeChild.nextSibling;
	                if (!getNodeKey(curFromNodeChild)) {
	                    removeNode(curFromNodeChild, fromEl);
	                }
	                curFromNodeChild = fromNextSibling;
	            }
	        }

	        var specialElHandler = specialElHandlers[fromEl.nodeName];
	        if (specialElHandler) {
	            specialElHandler(fromEl, toEl);
	        }
	    } // END: morphEl(...)

	    var morphedNode = fromNode;
	    var morphedNodeType = morphedNode.nodeType;
	    var toNodeType = toNode.nodeType;

	    if (!childrenOnly) {
	        // Handle the case where we are given two DOM nodes that are not
	        // compatible (e.g. <div> --> <span> or <div> --> TEXT)
	        if (morphedNodeType === ELEMENT_NODE) {
	            if (toNodeType === ELEMENT_NODE) {
	                if (!compareNodeNames(fromNode, toNode)) {
	                    onNodeDiscarded(fromNode);
	                    morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
	                }
	            } else {
	                // Going from an element node to a text node
	                morphedNode = toNode;
	            }
	        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
	            if (toNodeType === morphedNodeType) {
	                morphedNode.nodeValue = toNode.nodeValue;
	                return morphedNode;
	            } else {
	                // Text node to something else
	                morphedNode = toNode;
	            }
	        }
	    }

	    if (morphedNode === toNode) {
	        // The "to node" was not compatible with the "from node" so we had to
	        // toss out the "from node" and use the "to node"
	        onNodeDiscarded(fromNode);
	    } else {
	        morphEl(morphedNode, toNode, childrenOnly);

	        for (var k in fromNodesLookup) {
	            var elToRemove = fromNodesLookup[k];
	            if (elToRemove) {
	                removeNode(elToRemove, elToRemove.parentNode);
	            }
	        }
	    }

	    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
	        // If we had to swap out the from node with a new node because the old
	        // node was not compatible with the target node then we need to
	        // replace the old DOM node in the original DOM tree. This is only
	        // possible if the original DOM node was part of a DOM tree which
	        // we know is the case if it has a parent node.
	        fromNode.parentNode.replaceChild(morphedNode, fromNode);
	    }

	    return morphedNode;
	}

	module.exports = morphdom;


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = [
	  // attribute events (can be set with attributes)
	  'onclick',
	  'ondblclick',
	  'onmousedown',
	  'onmouseup',
	  'onmouseover',
	  'onmousemove',
	  'onmouseout',
	  'ondragstart',
	  'ondrag',
	  'ondragenter',
	  'ondragleave',
	  'ondragover',
	  'ondrop',
	  'ondragend',
	  'onkeydown',
	  'onkeypress',
	  'onkeyup',
	  'onunload',
	  'onabort',
	  'onerror',
	  'onresize',
	  'onscroll',
	  'onselect',
	  'onchange',
	  'onsubmit',
	  'onreset',
	  'onfocus',
	  'onblur',
	  'oninput',
	  // other common events
	  'oncontextmenu',
	  'onfocusin',
	  'onfocusout'
	]


/***/ },
/* 5 */
/***/ function(module, exports) {

	var SVGNS = 'http://www.w3.org/2000/svg'

	var BOOL_PROPS = {
	  autofocus: 1,
	  checked: 1,
	  defaultchecked: 1,
	  disabled: 1,
	  formnovalidate: 1,
	  indeterminate: 1,
	  readonly: 1,
	  required: 1,
	  selected: 1,
	  willvalidate: 1
	}

	var SVG_TAGS = [
	  'svg',
	  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
	  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
	  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
	  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
	  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
	  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
	  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
	  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
	  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
	  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
	  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
	  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
	  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
	  'tspan', 'use', 'view', 'vkern'
	]

	var createElement = function (tag, props, ...children) {
	  var el
	  props = props || {}

	  // If an svg tag, it needs a namespace
	  if (SVG_TAGS.indexOf(tag) !== -1) {
	    props.namespace = SVGNS
	  }

	  // If we are using a namespace
	  var ns = false
	  if (props.namespace) {
	    ns = props.namespace
	    delete props.namespace
	  }

	  // Create the element
	  if (ns) {
	    el = document.createElementNS(ns, tag)
	  } else {
	    el = document.createElement(tag)
	  }

	  // Create the properties
	  for (var p in props) {
	    if (props.hasOwnProperty(p)) {
	      var key = p.toLowerCase()
	      var val = props[p]

	      // If a property is boolean, set itself to the key
	      if (BOOL_PROPS[key]) {
	        if (val === 'true') val = key
	        else if (val === 'false') continue
	      }
	      // if property is a reference
	      if (key.slice(0, 4) === 'ref-') {
	        var propName = p.replace('ref-', '')
	        el.customProperties = el.customProperties || []
	        el.customProperties.push({name: propName, value: val})
	      } else {
	        // If a property prefers being set directly vs setAttribute
	        if (key.slice(0, 2) === 'on') {
	          el[p] = val
	        } else {
	          if (ns) {
	            el.setAttributeNS(null, p, val)
	          } else {
	            el.setAttribute(p, val)
	          }
	        }
	      }
	    }
	  }

	  function appendChild (childs) {
	    if (!Array.isArray(childs)) return
	    for (var i = 0; i < childs.length; i++) {
	      var node = childs[i]
	      if (Array.isArray(node)) {
	        appendChild(node)
	        continue
	      }

	      if (typeof node === 'number' ||
	        typeof node === 'boolean' ||
	        node instanceof Date ||
	        node instanceof RegExp) {
	        node = node.toString()
	      }

	      if (typeof node === 'string') {
	        if (el.lastChild && el.lastChild.nodeName === '#text') {
	          el.lastChild.nodeValue += node
	          continue
	        }
	        node = document.createTextNode(node)
	      }

	      if (node && node.nodeType) {
	        el.appendChild(node)
	      }
	    }
	  }
	  appendChild(children)

	  return el
	}

	module.exports = function (directives = []) {
	  return (tag, props, ...children) => {
	    for (var i = 0; i < directives.length; i++) {
	      var el = directives[i](tag, props, ...children)
	      if (el) {
	        return el
	      }
	    }
	    return createElement(tag, props, ...children)
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	var hasCustomEventsSupport = typeof CustomEvent !== 'undefined'

	module.exports = function (plasma) {
	  var domPlasma = {}
	  for (var key in plasma) {
	    domPlasma[key] = plasma[key]
	  }
	  domPlasma.target = window.document

	  domPlasma.on = function (pattern, handler) {
	    this.target.addEventListener(pattern.type, handler)
	  }

	  domPlasma.once = function (pattern, handler) {
	    this.target.addEventListener(pattern.type, (e) => {
	      this.target.removeEventListener(pattern.type, handler)
	      handler(e)
	    })
	  }

	  domPlasma.emit = function (input) {
	    var event
	    if (!hasCustomEventsSupport) { // because of IE
	      event = document.createEvent('Event')
	      event.initEvent(input.type, input.bubbles, input.cancelable)
	      for (var key in input.eventData) {
	        event[key] = input.eventData[key]
	      }
	    } else {
	      event = new CustomEvent(input.type, {
	        detail: input.eventData,
	        bubbles: input.bubbles,
	        cancelable: input.cancelable
	      })
	    }
	    this.target.dispatchEvent(event)
	  }

	  domPlasma.off = function (pattern, handler) {
	    this.target.removeEventListener(pattern.type, handler)
	  }

	  domPlasma.useTarget = function (el) {
	    var targetDomPlasma = {}
	    for (var key in domPlasma) {
	      targetDomPlasma[key] = domPlasma[key]
	    }
	    targetDomPlasma.target = el
	    return targetDomPlasma
	  }

	  return domPlasma
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function (oval) {
	  return function (tag, tagName, root) {
	    tag.tagName = tagName
	    tag.root = root
	    tag.plasma = oval.plasma.useTarget(tag.root)
	    tag.root.oval_tag = tag
	    tag.childTags = []
	    tag.id = Math.random()
	    tag.lifecycle = {
	      constructed: true,
	      mounted: false
	    }
	    tag.innerChildren = []
	    while (tag.root.hasChildNodes()) {
	      tag.innerChildren.push(tag.root.removeChild(tag.root.firstChild))
	    }

	    tag.createElement = oval.createElement()

	    tag.injectDirectives = function (directives) {
	      this.createElement = oval.createElement(directives)
	    }

	    tag.update = function () {
	      if (this.root.customProperties) {
	        for (var i = 0; i < this.root.customProperties.length; i++) {
	          var prop = this.root.customProperties[i]
	          this[prop.name] = prop.value
	        }
	      }

	      if (this.shouldRender && !this.shouldRender()) {
	        return
	      }

	      this.view = this.render(this.createElement)

	      if (!this.lifecycle.mounted) {
	        this.emit('mount')
	      }

	      this.emit('update')

	      oval.updateElement(this.root, this.view)

	      var newTags = oval.mountAll('*', this.root)
	      for (var i = 0; i < this.childTags.length; i++) {
	        var found = false
	        for (var k = 0; k < newTags.length; k++) {
	          if (this.childTags[i] === newTags[k]) {
	            found = true
	          }
	        }
	        if (!found) {
	          this.childTags[i].unmount()
	        }
	      }
	      this.childTags = newTags

	      this.emit('updated')

	      if (!this.lifecycle.mounted) {
	        this.lifecycle.mounted = true
	        this.emit('mounted')
	      }
	    }

	    tag.unmount = function (skipRemove) {
	      if (this.lifecycle.mounted && this.root.parentNode && !skipRemove) {
	        this.root.remove()
	      }
	      this.lifecycle.mounted = false
	      for (var i = 0; i < this.childTags.length; i++) {
	        this.childTags[i].unmount(true)
	      }
	      this.emit('unmount')
	    }

	    tag.emit = function (eventName, eventData, bubbles) {
	      return this.plasma.emit({
	        type: eventName,
	        eventData: eventData,
	        bubbles: bubbles
	      })
	    }

	    tag.once = function (eventName, handler) {
	      return this.plasma.once({
	        type: eventName
	      }, handler)
	    }

	    tag.on = function (eventName, handler) {
	      return this.plasma.on({
	        type: eventName
	      }, handler)
	    }

	    tag.off = function (eventName, handler) {
	      this.plasma.off({
	        type: eventName
	      }, handler)
	    }
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(oval) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Tag = function () {
	  function Tag(tagName, root) {
	    _classCallCheck(this, Tag);

	    oval.BaseTag(this, tagName, root);
	    var tag = this;
	    tag.links = {
	      home: '#home',
	      about: '#about'
	    };
	  }

	  _createClass(Tag, [{
	    key: 'render',
	    value: function render(createElement) {
	      var tag = this;
	      return createElement(
	        'navigation',
	        null,
	        createElement(
	          'ul',
	          null,
	          createElement(
	            'li',
	            null,
	            createElement(
	              'a',
	              { href: tag.links.home },
	              'Home'
	            )
	          ),
	          createElement(
	            'li',
	            null,
	            createElement(
	              'a',
	              { href: tag.links.about },
	              'About'
	            )
	          )
	        )
	      );
	    }
	  }]);

	  return Tag;
	}();

	oval.registerTag('navigation', Tag);
	exports.default = Tag;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }
/******/ ]);