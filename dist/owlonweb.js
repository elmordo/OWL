/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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
var LookupError = (function (_super) {
    __extends(LookupError, _super);
    function LookupError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LookupError;
}(Error));
exports.LookupError = LookupError;
var ServiceBase = (function () {
    function ServiceBase() {
    }
    return ServiceBase;
}());
exports.ServiceBase = ServiceBase;
var ServiceContainer = (function () {
    function ServiceContainer(factory, isShared) {
        this._instance = null;
        this._shared = isShared;
        this._factory = factory;
    }
    ServiceContainer.prototype.getInstance = function () {
        if (this._shared)
            return this._getOrCreateSharedInstance();
        else
            return this.createInstance();
    };
    ServiceContainer.prototype.isShared = function () {
        return this._shared;
    };
    ServiceContainer.prototype.createInstance = function () {
        var instance;
        instance = this._factory();
        return instance;
    };
    ServiceContainer.prototype._getOrCreateSharedInstance = function () {
        if (this._instance === null)
            this._instance = this.createInstance();
        return this._instance;
    };
    return ServiceContainer;
}());
var ServiceNamespace = (function () {
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
    ServiceNamespace.prototype.registerServiceContainer = function (name, container) {
        this[name] = function () {
            return container.getInstance();
        };
    };
    ServiceNamespace.prototype._getNamespace = function (nsName) {
        var ns = this[nsName];
        if (ns === undefined)
            throw new LookupError("Service named '" + nsName + "' not found.");
        return ns;
    };
    ServiceNamespace.prototype._newNamespace = function (nsName) {
        var ns = new ServiceNamespace();
        this[nsName] = ns;
    };
    return ServiceNamespace;
}());
exports.ServiceNamespace = ServiceNamespace;
var ServiceManager = (function () {
    function ServiceManager(rootNamespace) {
        if (rootNamespace === void 0) { rootNamespace = null; }
        if (rootNamespace == null)
            rootNamespace = new ServiceNamespace();
        this._rootNamespace = rootNamespace;
    }
    ServiceManager.prototype.registerService = function (path, factory, isShared) {
        if (isShared === void 0) { isShared = true; }
        var pathInfo = this._splitPath(path);
        var ns = this._getNamespaceByPathArray(pathInfo.pathParts);
        var container = new ServiceContainer(factory, isShared);
        ns.registerServiceContainer(pathInfo.serviceName, container);
    };
    ServiceManager.prototype.getNamespaceByPath = function (path) {
        var parts = path.split(".");
        return this._getNamespaceByPathArray(parts);
    };
    ServiceManager.prototype.getServiceByPath = function (path) {
        var pathInfo = this._splitPath(path);
        var ns = this._getNamespaceByPathArray(pathInfo.pathParts);
        var factory = ns[pathInfo.serviceName];
        if (!factory)
            throw new LookupError("Service '" + pathInfo.serviceName + "' not found");
        var result = ns[pathInfo.serviceName]();
        return result;
    };
    Object.defineProperty(ServiceManager.prototype, "rootNamespace", {
        get: function () {
            return this._rootNamespace;
        },
        enumerable: true,
        configurable: true
    });
    ServiceManager.prototype._getNamespaceByPathArray = function (pathArray) {
        var current = this._rootNamespace;
        pathArray.forEach(function (nsName) {
            current = current.getNamespace(nsName);
        }, this);
        return current;
    };
    ServiceManager.prototype._splitPath = function (path) {
        var result = new ServicePathInfo();
        var parts = path.split(".");
        result.serviceName = parts[parts.length - 1];
        result.pathParts = parts.slice(0, parts.length - 1);
        return result;
    };
    return ServiceManager;
}());
exports.ServiceManager = ServiceManager;
var ServicePathInfo = (function () {
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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
var DomManipulator = (function () {
    function DomManipulator(window, rootElement) {
        this.window = window;
        this._cache = new MappedElementCache(window.document);
        this._nodeTypeLookup = new NodeMapperAbstractFactoryLookup();
        this._initializeLookup();
        this.rootElement = this.mapNode(rootElement);
    }
    DomManipulator.prototype.createNewFragment = function (html) {
        var parser = new DOMParser();
        var fragment = parser.parseFromString(html, "text/xml");
        var element = fragment.firstChild;
        return this.mapNode(element);
    };
    DomManipulator.prototype.mapNode = function (node) {
        if (this._cache.isCached(node))
            return this._cache.getCached(node);
        var nodeType = node.nodeType;
        var factory = this._nodeTypeLookup[nodeType];
        if (factory === undefined)
            throw new Error("Factory for node type '" + nodeType + "' not found");
        var mappedNode = factory.getFactory(node).createMapper(node, this);
        this._cache.addElement(mappedNode);
        return mappedNode;
    };
    DomManipulator.prototype._initializeLookup = function () {
        this._initializeAttrLookup();
        this._initializeTextLookup();
        this._initializeElementLookup();
        this._initializeCommentLookup();
    };
    DomManipulator.prototype._initializeAttrLookup = function () {
        this._createAndSetAbstractFactory(Node.ATTRIBUTE_NODE, new CommonAttributeMapper());
    };
    DomManipulator.prototype._initializeTextLookup = function () {
        this._createAndSetAbstractFactory(Node.TEXT_NODE, new CommonTextMapper());
    };
    DomManipulator.prototype._initializeElementLookup = function () {
        this._createAndSetAbstractFactory(Node.ELEMENT_NODE, new CommonElementMapper());
    };
    DomManipulator.prototype._initializeCommentLookup = function () {
        this._createAndSetAbstractFactory(Node.COMMENT_NODE, new CommonCommentMapper());
    };
    DomManipulator.prototype._createAndSetAbstractFactory = function (nodeType, fallback) {
        var factory = new NodeMapperAbstractFactory();
        factory.fallback = fallback;
        this._nodeTypeLookup[nodeType] = factory;
    };
    return DomManipulator;
}());
exports.DomManipulator = DomManipulator;
function domManipulatorFactory(window, rootElement) {
    var manipulator = new DomManipulator(window, rootElement);
    return manipulator;
}
exports.domManipulatorFactory = domManipulatorFactory;
var NodeMapperAbstractFactoryLookup = (function () {
    function NodeMapperAbstractFactoryLookup() {
    }
    return NodeMapperAbstractFactoryLookup;
}());
var NodeMapperAbstractFactory = (function () {
    function NodeMapperAbstractFactory() {
    }
    NodeMapperAbstractFactory.prototype.getFactory = function (node) {
        var factory = null;
        if (factory == null) {
            if (this._fallback == null)
                throw new Error("Factory for node not found");
            factory = this._fallback;
        }
        return factory;
    };
    Object.defineProperty(NodeMapperAbstractFactory.prototype, "fallback", {
        get: function () {
            return this._fallback;
        },
        set: function (val) {
            this._fallback = val;
        },
        enumerable: true,
        configurable: true
    });
    return NodeMapperAbstractFactory;
}());
var CommonElementMapper = (function () {
    function CommonElementMapper() {
    }
    CommonElementMapper.prototype.createMapper = function (node, manipulator) {
        return new CommonHtmlElement(node, manipulator);
    };
    CommonElementMapper.prototype.isNodeMappable = function (node) {
        return node.nodeType == Node.ELEMENT_NODE;
    };
    return CommonElementMapper;
}());
exports.CommonElementMapper = CommonElementMapper;
var CommonAttributeMapper = (function () {
    function CommonAttributeMapper() {
    }
    CommonAttributeMapper.prototype.createMapper = function (node, manipulator) {
        return new CommonHtmlAttribute(node, manipulator);
    };
    CommonAttributeMapper.prototype.isNodeMappable = function (node) {
        return node.nodeType == Node.ATTRIBUTE_NODE;
    };
    return CommonAttributeMapper;
}());
exports.CommonAttributeMapper = CommonAttributeMapper;
var CommonTextMapper = (function () {
    function CommonTextMapper() {
    }
    CommonTextMapper.prototype.createMapper = function (node, manipulator) {
        return new CommonHtmlText(node, manipulator);
    };
    CommonTextMapper.prototype.isNodeMappable = function (node) {
        return node.nodeType == Node.TEXT_NODE;
    };
    return CommonTextMapper;
}());
exports.CommonTextMapper = CommonTextMapper;
var CommonCommentMapper = (function () {
    function CommonCommentMapper() {
    }
    CommonCommentMapper.prototype.createMapper = function (node, manipulator) {
        return new CommonHtmlComment(node, manipulator);
    };
    CommonCommentMapper.prototype.isNodeMappable = function (node) {
        return node.nodeType == Node.COMMENT_NODE;
    };
    return CommonCommentMapper;
}());
exports.CommonCommentMapper = CommonCommentMapper;
var MappedNodeLookup = (function () {
    function MappedNodeLookup() {
    }
    return MappedNodeLookup;
}());
var MappedElementCache = (function () {
    function MappedElementCache(document) {
        this._cache = new MappedNodeLookup();
        this._document = document;
    }
    MappedElementCache.prototype.isCached = function (element) {
        return this._hasNodeId(element);
    };
    MappedElementCache.prototype.addElement = function (mappedNode) {
        var id = this._setNodeId(mappedNode.node);
        this._cache[id] = mappedNode;
    };
    MappedElementCache.prototype.getCached = function (node) {
        var id = this._getNodeId(node);
        return this._cache[id];
    };
    MappedElementCache.prototype.removeElement = function (node) {
        var id = this._getNodeId(node);
        delete this._cache[id];
    };
    MappedElementCache.prototype._hasNodeId = function (node) {
        var untyped = node;
        return untyped[MappedElementCache.ELEMENT_INTERNAL_ID_NAME] !== undefined;
    };
    MappedElementCache.prototype._getNodeId = function (node) {
        var untyped = node;
        var idValue = untyped[MappedElementCache.ELEMENT_INTERNAL_ID_NAME];
        if (idValue === undefined)
            throw new Error("Element is not cached");
        return Number(idValue);
    };
    MappedElementCache.prototype._setNodeId = function (node) {
        var id = MappedElementCache._nextId++;
        var untyped = node;
        untyped[MappedElementCache.ELEMENT_INTERNAL_ID_NAME] = id;
        return id;
    };
    MappedElementCache.ELEMENT_INTERNAL_ID_NAME = "oow-id";
    MappedElementCache._nextId = 1;
    return MappedElementCache;
}());
var AttributeCache = (function () {
    function AttributeCache() {
    }
    return AttributeCache;
}());
var CommonHtmlNode = (function () {
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
var CommonHtmlElement = (function (_super) {
    __extends(CommonHtmlElement, _super);
    function CommonHtmlElement(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    CommonHtmlElement.prototype.append = function (node) {
        this.element.appendChild(node.node);
    };
    Object.defineProperty(CommonHtmlElement.prototype, "element", {
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlElement.prototype, "chidlren", {
        get: function () {
            var children = this.element.childNodes;
            var result = new CommonNodeList();
            for (var i = 0; i < children.length; ++i) {
                var node = children.item(i);
                var mapped = this._domManipulator.mapNode(node);
                result.push(mapped);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlElement;
}(CommonHtmlNode));
exports.CommonHtmlElement = CommonHtmlElement;
;
var CommonHtmlAttribute = (function (_super) {
    __extends(CommonHtmlAttribute, _super);
    function CommonHtmlAttribute(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonHtmlAttribute.prototype, "attribute", {
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlAttribute.prototype, "name", {
        get: function () {
            return this.attribute.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlAttribute.prototype, "value", {
        get: function () {
            return this.attribute.value;
        },
        set: function (val) {
            this.attribute.value = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlAttribute;
}(CommonHtmlNode));
exports.CommonHtmlAttribute = CommonHtmlAttribute;
var CommonHtmlText = (function (_super) {
    __extends(CommonHtmlText, _super);
    function CommonHtmlText(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonHtmlText.prototype, "text", {
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlText.prototype, "content", {
        get: function () {
            return this.text.textContent;
        },
        set: function (val) {
            this.text.textContent = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlText;
}(CommonHtmlNode));
exports.CommonHtmlText = CommonHtmlText;
var CommonHtmlComment = (function (_super) {
    __extends(CommonHtmlComment, _super);
    function CommonHtmlComment(node, manipulator) {
        return _super.call(this, node, manipulator) || this;
    }
    Object.defineProperty(CommonHtmlComment.prototype, "comment", {
        get: function () {
            return this.node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlComment.prototype, "content", {
        get: function () {
            return this.comment.text;
        },
        set: function (val) {
            this.comment.text = val;
        },
        enumerable: true,
        configurable: true
    });
    return CommonHtmlComment;
}(CommonHtmlNode));
exports.CommonHtmlComment = CommonHtmlComment;
var CommonNodeList = (function (_super) {
    __extends(CommonNodeList, _super);
    function CommonNodeList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CommonNodeList.prototype.first = function () {
        if (this.length == 0)
            throw new Error("The list is empty");
        return this[0];
    };
    CommonNodeList.prototype.last = function () {
        if (this.length == 0)
            throw new Error("The list is empty");
        return this[this.length - 1];
    };
    return CommonNodeList;
}(Array));
exports.CommonNodeList = CommonNodeList;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(1);
__webpack_require__(5);
module.exports = __webpack_require__(0);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(1);
var service_management_1 = __webpack_require__(0);
var OwlInWeb = (function () {
    function OwlInWeb() {
        this._serviceManager = new service_management_1.ServiceManager();
        this._domManipulator = null;
    }
    OwlInWeb.prototype.addMoudle = function (name, dependencies, factory) {
        this._moduleManager.addModule(name, dependencies, factory);
    };
    OwlInWeb.prototype.run = function (window, rootElement) {
        this._domManipulator = new dom_1.DomManipulator(window, rootElement);
        this._initializeCommonServices();
        this._moduleManager.initializeModules(this._serviceManager);
    };
    Object.defineProperty(OwlInWeb.prototype, "serviceManager", {
        get: function () {
            return this._serviceManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlInWeb.prototype, "domManipulator", {
        get: function () {
            return this._domManipulator;
        },
        enumerable: true,
        configurable: true
    });
    OwlInWeb.prototype._initializeCommonServices = function () {
        var _this = this;
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_APPLICATION, function () { return _this; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_DOM_MANIPULATOR, function () { return _this._domManipulator; });
    };
    OwlInWeb.SERVICE_PREFIX_APPLICATION = "oow";
    OwlInWeb.SERVICE_PREFIX_DOM_MANIPULATOR = "domManipulator";
    return OwlInWeb;
}());
exports.OwlInWeb = OwlInWeb;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Event = (function () {
    function Event(type, data) {
        if (data === void 0) { data = null; }
        this.type = type;
        this._propagate = true;
        this.data = data;
    }
    Object.defineProperty(Event.prototype, "propagate", {
        get: function () {
            return this._propagate;
        },
        set: function (val) {
            this._propagate = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "currentTarget", {
        get: function () {
            return this._currentTarget;
        },
        set: function (val) {
            this._currentTarget = val;
        },
        enumerable: true,
        configurable: true
    });
    return Event;
}());
exports.Event = Event;
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._queue = new Array();
        this._handlers = new EventHandlerLookup();
        this._inDispatchProcess = false;
    }
    EventDispatcher.prototype.dispatchEvent = function (evt) {
        this._queue.push(evt);
        if (!this._inDispatchProcess)
            this._processQueue();
    };
    EventDispatcher.prototype.addEventListener = function (eventType, callback, context) {
        if (context === void 0) { context = null; }
        var handlers = this._getHandlerHolder(eventType);
        var index = handlers.length;
        handlers.push(new EventHandler(callback, context));
        return this._createRemover(handlers, index);
    };
    EventDispatcher.prototype._getHandlerHolder = function (eventType) {
        if (this._handlers[eventType] === undefined)
            this._handlers[eventType] = new Array();
        return this._handlers[eventType];
    };
    EventDispatcher.prototype._createRemover = function (arr, index) {
        function remover() {
            delete arr[index];
        }
        return remover;
    };
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
var EventHandlerLookup = (function () {
    function EventHandlerLookup() {
    }
    return EventHandlerLookup;
}());
var EventHandler = (function () {
    function EventHandler(callback, context) {
        if (context === void 0) { context = null; }
        this._callback = callback;
        this._context = context;
    }
    EventHandler.prototype.handle = function (event) {
        if (this._context)
            this._callback.call(this._context, event);
        else
            this._callback(event);
    };
    Object.defineProperty(EventHandler.prototype, "callback", {
        get: function () {
            return this._callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventHandler.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return EventHandler;
}());


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var service_management_1 = __webpack_require__(0);
var ModuleManager = (function () {
    function ModuleManager() {
    }
    ModuleManager.prototype.construct = function () {
        this._modules = new Array();
    };
    ModuleManager.prototype.addModule = function (name, dependencies, factory) {
        this._modules.push(new Module(name, dependencies, factory));
    };
    ModuleManager.prototype.initializeModules = function (serviceManager) {
        var resolver = this._createResolver();
        var moduleLookup = new Object();
        var moduleManagers = new ServiceManagerLookup();
        var moduleServiceManager = new service_management_1.ServiceManager(serviceManager.getNamespaceByPath(ModuleManager.MODULE_NS));
        for (var _i = 0, _a = this._modules; _i < _a.length; _i++) {
            var m = _a[_i];
            moduleLookup[m.name] = m;
        }
        while (resolver.getRemainingModulesCount() > 0) {
            var moduleName = resolver.getSatisfiedModuleName();
            var moduleInstance = moduleLookup[moduleName];
            var sm = this._initializeModule(moduleInstance, serviceManager, moduleServiceManager, moduleManagers);
            moduleManagers[moduleName] = sm;
            resolver.markAsResolved(moduleName);
        }
    };
    ModuleManager.prototype._createResolver = function () {
        var resolver = new DependencyResolver();
        for (var _i = 0, _a = this._modules; _i < _a.length; _i++) {
            var m = _a[_i];
            resolver.addModule(m.name, m.dependencies);
        }
        return resolver;
    };
    ModuleManager.prototype._initializeModule = function (moduleInstance, rootServiceManager, moduleLevelServiceManager, moduleManagers) {
        var moduleServiceManager = new service_management_1.ServiceManager(moduleLevelServiceManager.getNamespaceByPath(moduleInstance.name));
        var customizedLookup = this._buildLookupForModuleFactory(moduleManagers, moduleInstance.dependencies);
        moduleInstance.factoryFn(rootServiceManager, moduleServiceManager, customizedLookup);
        return moduleServiceManager;
    };
    ModuleManager.prototype._buildLookupForModuleFactory = function (allManagers, dependencies) {
        var result = new ServiceManagerLookup();
        for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            var d = dependencies_1[_i];
            result[d] = allManagers[d];
        }
        return result;
    };
    ModuleManager.MODULE_NS = "module";
    return ModuleManager;
}());
exports.ModuleManager = ModuleManager;
var ServiceManagerLookup = (function () {
    function ServiceManagerLookup() {
    }
    return ServiceManagerLookup;
}());
exports.ServiceManagerLookup = ServiceManagerLookup;
var Module = (function () {
    function Module(name, dependecies, factory) {
        this._name = name;
        this._dependencies = dependecies;
        this._factoryFn = factory;
    }
    Object.defineProperty(Module.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "dependencies", {
        get: function () {
            return this._dependencies;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "factoryFn", {
        get: function () {
            return this._factoryFn;
        },
        enumerable: true,
        configurable: true
    });
    return Module;
}());
var DependencyResolver = (function () {
    function DependencyResolver() {
    }
    DependencyResolver.prototype.construct = function () {
        this._remainingDependencies = new Array();
    };
    DependencyResolver.prototype.addModule = function (moduleName, dependencies) {
        var record = this._getRecord(moduleName);
        if (record)
            record.addDependencies(dependencies);
    };
    DependencyResolver.prototype.markAsResolved = function (moduleName) {
        var record = this._tryToGetRecord(moduleName);
        var index = this._remainingDependencies.indexOf(record);
        this._remainingDependencies.splice(index, 1);
        for (var _i = 0, _a = this._remainingDependencies; _i < _a.length; _i++) {
            var r = _a[_i];
            r.satisfyDepndency(moduleName);
        }
    };
    DependencyResolver.prototype.getRemainingModulesCount = function () {
        return this._remainingDependencies.length;
    };
    DependencyResolver.prototype.getSatisfiedModuleName = function () {
        var result = null;
        for (var _i = 0, _a = this._remainingDependencies; _i < _a.length; _i++) {
            var r = _a[_i];
            if (r.isSatisfied) {
                result = r.name;
                break;
            }
        }
        if (!result)
            throw new Error("Dependencies are not satisfied");
        return result;
    };
    DependencyResolver.prototype._tryToGetRecord = function (moduleName) {
        var record = this._getRecord(moduleName);
        if (record == null)
            throw new Error("Module '" + moduleName + "' is not registered");
        return record;
    };
    DependencyResolver.prototype._getRecord = function (moduleName) {
        var record = null;
        for (var _i = 0, _a = this._remainingDependencies; _i < _a.length; _i++) {
            var x = _a[_i];
            if (x.name == moduleName) {
                record = x;
                break;
            }
        }
        return record;
    };
    return DependencyResolver;
}());
var DependencyResolvingRecord = (function () {
    function DependencyResolvingRecord() {
    }
    DependencyResolvingRecord.prototype.construct = function (name, dependencies) {
        this.name = name;
        this.dependencies = new Array();
        this.addDependencies(dependencies);
    };
    DependencyResolvingRecord.prototype.satisfyDepndency = function (dependency) {
        var index = this.dependencies.indexOf(dependency);
        if (index != -1) {
            this.dependencies.splice(index, 1);
        }
    };
    DependencyResolvingRecord.prototype.addDependencies = function (dependencies) {
        this.dependencies.push.apply(this.dependencies, dependencies);
    };
    Object.defineProperty(DependencyResolvingRecord.prototype, "isSatisfied", {
        get: function () {
            return this.dependencies.length == 0;
        },
        enumerable: true,
        configurable: true
    });
    return DependencyResolvingRecord;
}());


/***/ })
/******/ ]);