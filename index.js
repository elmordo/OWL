"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DomManipulator = /** @class */ (function () {
    function DomManipulator(window, rootElement) {
        this.window = window;
        this.rootElement = this.mapNode(rootElement);
        this._cache = new MappedElementCache(window.document);
        this._nodeTypeLookup = new NodeMapperAbstractFactoryLookup();
        this._initializeLookup();
    }
    DomManipulator.prototype.createNewFragment = function (html) {
        var parser = new DOMParser();
        var fragment = parser.parseFromString(html, "text/xml");
        var element = fragment.firstChild;
        return this.mapNode(element);
    };
    DomManipulator.prototype.mapNode = function (node) {
        // TODO: real mapping
        return new CommonHtmlElement(node, this);
    };
    DomManipulator.prototype._initializeLookup = function () {
        this._initializeAttrLookup();
        this._initializeTextLookup();
        this._initializeElementLookup();
        this._initializeCommentLookup();
    };
    DomManipulator.prototype._initializeAttrLookup = function () {
        this._nodeTypeLookup[Node.ATTRIBUTE_NODE] = new NodeMapperAbstractFactory();
    };
    DomManipulator.prototype._initializeTextLookup = function () {
        this._nodeTypeLookup[Node.TEXT_NODE] = new NodeMapperAbstractFactory();
    };
    DomManipulator.prototype._initializeElementLookup = function () {
        this._nodeTypeLookup[Node.ELEMENT_NODE] = new NodeMapperAbstractFactory();
    };
    DomManipulator.prototype._initializeCommentLookup = function () {
        this._nodeTypeLookup[Node.COMMENT_NODE] = new NodeMapperAbstractFactory();
    };
    return DomManipulator;
}());
exports.DomManipulator = DomManipulator;
function domManipulatorFactory(window, rootElement) {
    var manipulator = new DomManipulator(window, rootElement);
    return manipulator;
}
exports.domManipulatorFactory = domManipulatorFactory;
var NodeMapperAbstractFactoryLookup = /** @class */ (function () {
    function NodeMapperAbstractFactoryLookup() {
    }
    return NodeMapperAbstractFactoryLookup;
}());
var NodeMapperAbstractFactory = /** @class */ (function () {
    function NodeMapperAbstractFactory() {
    }
    NodeMapperAbstractFactory.prototype.getFactory = function (node) {
        return null;
    };
    return NodeMapperAbstractFactory;
}());
/**
 * contains <cache id>-<mapped element> pairs
 */
var MappedElementLookup = /** @class */ (function () {
    function MappedElementLookup() {
    }
    return MappedElementLookup;
}());
/**
 * hold already mapped elements
 */
var MappedElementCache = /** @class */ (function () {
    /**
     * initialize instance
     */
    function MappedElementCache(document) {
        this._cache = new MappedElementLookup();
        this._document = document;
    }
    /**
     * is element cached?
     * @param {HTMLElement} element element to test
     * @return {boolean} true if element is cached, false otherwise
     */
    MappedElementCache.prototype.isCached = function (element) {
        return this._hasElementId(element);
    };
    /**
     * add element to the cache
     * @param {CommonHtmlElement} mappedElement mapped element to add
     */
    MappedElementCache.prototype.addElement = function (mappedElement) {
        var id = this._setElementId(mappedElement.element);
        this._cache[id] = mappedElement;
    };
    /**
     * get mapped element from the cache
     * @param {HTMLElement} element raw HTML element
     * @return {CommonHtmlElement} cached element
     * @throws Error element is not cached
     */
    MappedElementCache.prototype.getCached = function (element) {
        var id = this._getElementId(element);
        return this._cache[id];
    };
    /**
     * remove element from the cache
     * @param {HTMLElement} element raw HTML element to remove
     * @throws Error element is not in cache
     */
    MappedElementCache.prototype.removeElement = function (element) {
        var id = this._getElementId(element);
        delete this._cache[id];
    };
    /**
     * test if element has cache id
     * @param {HTMLElement} element raw HTML element to test
     * @return {boolean} true if element has cache id
     */
    MappedElementCache.prototype._hasElementId = function (element) {
        return element.attributes.getNamedItem(MappedElementCache.ELEMENT_INTERNAL_ID_NAME) !== null;
    };
    /**
     * get element cache id
     * @param {HTMLElement} element raw HTML element
     * @return {number} element's cache id
     * @throws Error element has no cache id
     */
    MappedElementCache.prototype._getElementId = function (element) {
        var attr = element.attributes.getNamedItem(MappedElementCache.ELEMENT_INTERNAL_ID_NAME);
        if (attr === null)
            throw new Error("Element is not cached");
        return Number(attr.value);
    };
    /**
     * set new cache id to the element
     * @param {HTMLElement} element raw HTML element
     * @return {number} new assigned cache id
     */
    MappedElementCache.prototype._setElementId = function (element) {
        var id = MappedElementCache._nextId++;
        var attr = this._document.createAttribute(MappedElementCache.ELEMENT_INTERNAL_ID_NAME);
        attr.value = id.toString();
        element.attributes.setNamedItem(attr);
        return id;
    };
    /**
     * attribute name where OOW internal id is stored
     * @type {String}
     */
    MappedElementCache.ELEMENT_INTERNAL_ID_NAME = "oow-id";
    return MappedElementCache;
}());
var AttributeCache = /** @class */ (function () {
    function AttributeCache() {
    }
    return AttributeCache;
}());
var CommonHtmlNode = /** @class */ (function () {
    function CommonHtmlNode(node, manipulator) {
        this._node = node;
        this._domManipulator = manipulator;
    }
    Object.defineProperty(CommonHtmlNode.prototype, "node", {
        get: function () {
            return this._node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlNode.prototype, "parent", {
        get: function () {
            return this._node.parentNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlNode.prototype, "domManipulator", {
        get: function () {
            return this._domManipulator;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlNode;
}());
exports.CommonHtmlNode = CommonHtmlNode;
var CommonHtmlElement = /** @class */ (function (_super) {
    __extends(CommonHtmlElement, _super);
    function CommonHtmlElement(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonHtmlElement.prototype, "element", {
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlElement;
}(CommonHtmlNode));
exports.CommonHtmlElement = CommonHtmlElement;
;
/**
 * wraps attribute (Attr class instance)
 */
var CommonHtmlAttribute = /** @class */ (function (_super) {
    __extends(CommonHtmlAttribute, _super);
    /**
     * initialize instance
     * @param {Attr} attribute attribute to wrap
     * @param {DomManipulator} manipulator original manipulator
     */
    function CommonHtmlAttribute(attribute, manipulator) {
        return _super.call(this, attribute, manipulator) || this;
    }
    Object.defineProperty(CommonHtmlAttribute.prototype, "attribute", {
        /**
         * wrapped attribute
         * @return {Attr} wrapped attribute
         */
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlAttribute.prototype, "name", {
        /**
         * get attribute name
         * @return {string} attribute name
         */
        get: function () {
            return this.attribute.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlAttribute.prototype, "value", {
        /**
         * get attribute value
         * @return {string} attribute value
         */
        get: function () {
            return this.attribute.value;
        },
        /**
         * set attribute value
         * @param {string} val new attribute value
         */
        set: function (val) {
            this.attribute.value = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlAttribute;
}(CommonHtmlNode));
exports.CommonHtmlAttribute = CommonHtmlAttribute;
/**
 * wraps text node
 */
var CommonTextNode = /** @class */ (function (_super) {
    __extends(CommonTextNode, _super);
    /**
     * initialize instance
     * @param {Text} node original raw text node
     * @param {DomManipulator} manipulator dom manipulator
     */
    function CommonTextNode(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonTextNode.prototype, "text", {
        /**
         * return wrapped raw node as Text
         * @return {Text} [description]
         */
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonTextNode.prototype, "content", {
        /**
         * get text content
         * @return {string} stored content
         */
        get: function () {
            return this.text.textContent;
        },
        /**
         * set stored content
         * @param {string} val new content of the text node
         */
        set: function (val) {
            this.text.textContent = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonTextNode;
}(CommonHtmlNode));
exports.CommonTextNode = CommonTextNode;
/**
 * represent comment node
 */
var CommonCommentNode = /** @class */ (function (_super) {
    __extends(CommonCommentNode, _super);
    /**
     * initialize instance
     * @param {Node} node node to wrap
     * @param {DomManipulator} manipulator manipulator
     */
    function CommonCommentNode(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonCommentNode.prototype, "comment", {
        /**
         * get wrapped comment node
         */
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonCommentNode.prototype, "content", {
        /**
         * get comment content
         * @return {string} comment content
         */
        get: function () {
            return this.comment.text;
        },
        /**
         * set new comment content
         * @param {string} val new comment content
         */
        set: function (val) {
            this.comment.text = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonCommentNode;
}(CommonHtmlNode));
exports.CommonCommentNode = CommonCommentNode;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * represents event
 */
var Event = /** @class */ (function () {
    /**
     * initialize instance
     * @param {string} type type of the event
     */
    function Event(type, data) {
        this.type = type;
        this._propagate = true;
        this.data = data;
    }
    Object.defineProperty(Event.prototype, "propagate", {
        /**
         * get propagate value
         * @return {boolean} propagate flag value
         */
        get: function () {
            return this._propagate;
        },
        /**
         * set new propagate flag value
         * @param {boolean} val new value to be set
         */
        set: function (val) {
            this._propagate = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "currentTarget", {
        /**
         * get current target
         * @return {EventDispatcher} current target
         */
        get: function () {
            return this._currentTarget;
        },
        /**
         * set current target
         * @param {EventDispatcher} val new current target
         */
        set: function (val) {
            this._currentTarget = val;
        },
        enumerable: true,
        configurable: true
    });
    return Event;
}());
exports.Event = Event;
/**
 * base class for all event dispatching classes
 */
var EventDispatcher = /** @class */ (function () {
    /**
     * initialize instance
     */
    function EventDispatcher() {
        this._queue = new Array();
        this._handlers = new EventHandlerLookup();
        this._inDispatchProcess = false;
    }
    /**
     * dispatch event
     * @param {Event} evt event instance to dispatch
     */
    EventDispatcher.prototype.dispatchEvent = function (evt) {
        this._queue.push(evt);
        if (!this._inDispatchProcess)
            this._processQueue();
    };
    /**
     * add event listener for event type
     * @param {string} eventType type of the event
     * @param {Function} callback function call when event is dispatched
     * @param {Object=null} context optional call context
     * @return {Function} listener remover
     */
    EventDispatcher.prototype.addEventListener = function (eventType, callback, context) {
        if (context === void 0) { context = null; }
        var handlers = this._getHandlerHolder(eventType);
        var index = handlers.length;
        handlers.push(new EventHandler(callback, context));
        return this._createRemover(handlers, index);
    };
    /**
     * get existing or create new holder of the event handlers
     * @param {string} eventType event type
     * @return {EventHandler[]} handler holder
     */
    EventDispatcher.prototype._getHandlerHolder = function (eventType) {
        if (this._handlers[eventType] === undefined)
            this._handlers[eventType] = new Array();
        return this._handlers[eventType];
    };
    /**
     * create remover for element in array
     * @type {A} type of the array
     * @param {A} arr array ot remove from
     * @param {number} index index of the element to remove
     * @returns Function remover
     */
    EventDispatcher.prototype._createRemover = function (arr, index) {
        function remover() {
            delete arr[index];
        }
        return remover;
    };
    /**
     * process event queue
     */
    EventDispatcher.prototype._processQueue = function () {
        this._inDispatchProcess = true;
        try {
            while (this._queue.length) {
                var evt = this._queue.shift();
                this._processEvent(evt);
            }
        }
        finally {
            this._inDispatchProcess = false;
        }
    };
    /**
     * process one event
     * @param {Event} evt event to process
     */
    EventDispatcher.prototype._processEvent = function (evt) {
        var handlers = this._getHandlerHolder(evt.type);
        handlers.forEach(function (handler) {
            try {
                handler.handle(evt);
            }
            catch (err) {
                console.error(err);
            }
        });
    };
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
var EventHandlerLookup = /** @class */ (function () {
    function EventHandlerLookup() {
    }
    return EventHandlerLookup;
}());
/**
 * hold information about event handler
 */
var EventHandler = /** @class */ (function () {
    /**
     * initialize instance
     * @param {Function} callback callback to set
     * @param {Object=null} context context object to call callback in
     */
    function EventHandler(callback, context) {
        if (context === void 0) { context = null; }
        this._callback = callback;
        this._context = context;
    }
    /**
     * handle event
     * @param {Event} event event to handle
     */
    EventHandler.prototype.handle = function (event) {
        if (this._context)
            this._callback.call(this._context, event);
        else
            this._callback(event);
    };
    Object.defineProperty(EventHandler.prototype, "callback", {
        /**
         * get callback instance
         * @return {Function} callback function
         */
        get: function () {
            return this._callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventHandler.prototype, "context", {
        /**
         * get context
         * @return {Object} context to call callback in
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return EventHandler;
}());
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * error thrown when item missing in ServiceIndex or Namespace index
 */
var LookupError = /** @class */ (function (_super) {
    __extends(LookupError, _super);
    function LookupError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LookupError;
}(Error));
exports.LookupError = LookupError;
var ServiceBase = /** @class */ (function () {
    function ServiceBase() {
    }
    return ServiceBase;
}());
exports.ServiceBase = ServiceBase;
/**
 * provides service instance
 */
var ServiceContainer = /** @class */ (function () {
    /**
     * initialize instance
     * @param {Function} factory factory function
     * @param {boolean} isShared is service shared? (one shared instance)
     */
    function ServiceContainer(factory, isShared) {
        this._instance = null;
        this._shared = isShared;
        this._factory = factory;
    }
    /**
     * get instance of the service
     * @return {ServiceBase} instance
     */
    ServiceContainer.prototype.getInstance = function () {
        if (this._shared)
            return this._getOrCreateSharedInstance();
        else
            return this.createInstance();
    };
    /**
     * is service shared?
     * @return {boolean} true if shared
     */
    ServiceContainer.prototype.isShared = function () {
        return this._shared;
    };
    /**
     * create new instance of the service
     * @return {ServiceBase} new instance of the service
     */
    ServiceContainer.prototype.createInstance = function () {
        var instance;
        instance = this._factory();
        return instance;
    };
    /**
     * get shred instance
     * if instance was not created yet, create new one
     * @return {ServiceBase} instance of the service
     */
    ServiceContainer.prototype._getOrCreateSharedInstance = function () {
        if (this._instance === null)
            this._instance = this.createInstance();
        return this._instance;
    };
    return ServiceContainer;
}());
/**
 * hold other namespaces and services
 */
var ServiceNamespace = /** @class */ (function () {
    function ServiceNamespace() {
    }
    ServiceNamespace.prototype.getNamespace = function (nsName) {
        var result = null;
        try {
            result = this._getNamespace(nsName);
        }
        catch (err) {
            this._newNamespace(nsName);
            result = this._getNamespace(nsName);
        }
        return result;
    };
    /**
     * register service container to the namespace
     * @param {string} name name of the service container
     * @param {ServiceContainer} container instance of the service container
     */
    ServiceNamespace.prototype.registerServiceContainer = function (name, container) {
        this[name] = function () {
            return container.getInstance();
        };
    };
    /**
     * get namespace from the lookup
     * throw error if namespace is not registered
     * @param {string} nsName name of the namespace
     * @return {ServiceNamespace} sub namespace
     * @throws LookupError namespace is unknown
     */
    ServiceNamespace.prototype._getNamespace = function (nsName) {
        var ns = this[nsName];
        // ns has to be found
        if (ns === undefined)
            throw new LookupError("Service named '" + nsName + "' not found.");
        return ns;
    };
    /**
     * create new namespace and register it into lookup
     * @param {string} nsName [description]
     */
    ServiceNamespace.prototype._newNamespace = function (nsName) {
        var ns = new ServiceNamespace();
        this[nsName] = ns;
    };
    return ServiceNamespace;
}());
exports.ServiceNamespace = ServiceNamespace;
/**
 * manage services
 */
var ServiceManager = /** @class */ (function (_super) {
    __extends(ServiceManager, _super);
    function ServiceManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * register new service into manager
     * @param {string} path path to service
     * @param {Function} factory factory function
     * @param {boolean=true} isShared true if service is shared
     */
    ServiceManager.prototype.registerService = function (path, factory, isShared) {
        if (isShared === void 0) { isShared = true; }
        var pathInfo = this._splitPath(path);
        var ns = this._getNamespaceByPathArray(pathInfo.pathParts);
        var container = new ServiceContainer(factory, isShared);
        ns.registerServiceContainer(pathInfo.serviceName, container);
    };
    /**
     * get namespace defined by path. If namespace does not exist, create new one
     * @param {string} path path to final namespace
     * @return {ServiceNamespace} target namespace
     */
    ServiceManager.prototype.getNamespaceByPath = function (path) {
        var parts = path.split(".");
        return this._getNamespaceByPathArray(parts);
    };
    /**
     * get service by path
     * @param {string} path path to service
     * @return {ServiceBase} service instance
     */
    ServiceManager.prototype.getServiceByPath = function (path) {
        var pathInfo = this._splitPath(path);
        var ns = this._getNamespaceByPathArray(pathInfo.pathParts);
        var factory = ns[pathInfo.serviceName];
        if (!factory)
            throw new LookupError("Service '" + pathInfo.serviceName + "' not found");
        var result = ns[pathInfo.serviceName]();
        return result;
    };
    /**
     * get namespace identified by array path
     * @param {string[]} pathArray array path
     * @return {ServiceNamespace} namespace
     */
    ServiceManager.prototype._getNamespaceByPathArray = function (pathArray) {
        var current = this;
        pathArray.forEach(function (nsName) {
            current = current.getNamespace(nsName);
        }, this);
        return current;
    };
    /**
     * split path to namespace path and service name
     * @param {string} path original path
     * @return {ServicePathInfo} splitted path
     */
    ServiceManager.prototype._splitPath = function (path) {
        var result = new ServicePathInfo();
        var parts = path.split(".");
        result.serviceName = parts[parts.length - 1];
        result.pathParts = parts.slice(0, parts.length - 1);
        return result;
    };
    return ServiceManager;
}(ServiceNamespace));
exports.ServiceManager = ServiceManager;
/**
 * hold information about path to service
 */
var ServicePathInfo = /** @class */ (function () {
    function ServicePathInfo() {
    }
    Object.defineProperty(ServicePathInfo.prototype, "serviceName", {
        get: function () {
            return this._serviceName;
        },
        set: function (v) {
            this._serviceName = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServicePathInfo.prototype, "pathParts", {
        get: function () {
            return this._pathParts;
        },
        set: function (v) {
            this._pathParts = v;
        },
        enumerable: true,
        configurable: true
    });
    return ServicePathInfo;
}());
