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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
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
var dom_1 = __webpack_require__(3);
var events_1 = __webpack_require__(5);
var dom_utils_1 = __webpack_require__(16);
var ComponentDescription = (function () {
    function ComponentDescription(name, rendererName, controllerName) {
        this._name = name;
        this._rendererName = rendererName;
        this._controllerName = controllerName;
    }
    Object.defineProperty(ComponentDescription.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentDescription.prototype, "rendererName", {
        get: function () {
            return this._rendererName;
        },
        set: function (val) {
            this._rendererName = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentDescription.prototype, "controllerName", {
        get: function () {
            return this._controllerName;
        },
        set: function (val) {
            this._controllerName = val;
        },
        enumerable: true,
        configurable: true
    });
    return ComponentDescription;
}());
exports.ComponentDescription = ComponentDescription;
var ComponentFactory = (function () {
    function ComponentFactory(serviceManager, domManipulator) {
        this._components = new ComponentLookup();
        this._serviceManager = serviceManager;
        this._domManipulator = domManipulator;
    }
    ComponentFactory.prototype.registerComponent = function (component) {
        this._assertNotExists(component.name);
        this._components[component.name] = component;
    };
    ComponentFactory.prototype.createComponentInstance = function (name, element) {
        this._assertExists(name);
        var componentDsc = this._components[name];
        var renderer = this._getRenderer(componentDsc);
        var mappedElement = new dom_1.CommonHtmlElement(element, this._domManipulator);
        var options = renderer.getOptions(mappedElement);
        var renderedContent = renderer.render(mappedElement, this._domManipulator, options);
        var controller = this._createController(componentDsc, options, renderedContent);
        controller.renderer = renderer;
        return controller;
    };
    ComponentFactory.prototype._getRenderer = function (description) {
        var rendererName = description.rendererName;
        return this._serviceManager.getServiceByPath(rendererName);
    };
    ComponentFactory.prototype._createController = function (description, options, rendered) {
        var controllerName = description.controllerName;
        var controller = this._serviceManager.getServiceByPath(controllerName);
        controller.serviceManager = this._serviceManager;
        controller.setup(rendered, options);
        return controller;
    };
    ComponentFactory.prototype._assertExists = function (name) {
        if (!this._components[name])
            throw new Error("Component '" + name + "' does not exist");
    };
    ComponentFactory.prototype._assertNotExists = function (name) {
        if (this._components[name])
            throw new Error("Component '" + name + "' is already registered");
    };
    return ComponentFactory;
}());
exports.ComponentFactory = ComponentFactory;
var ControllerManager = (function () {
    function ControllerManager() {
        this._lookup = new ControllerLookup();
    }
    ControllerManager.prototype.registerComponent = function (controller) {
        var id = controller.id;
        if (!id)
            throw new Error("Id has to be set");
        if (this._lookup[id])
            throw new Error("Controller '" + id + "' is already registered");
        this._lookup[id] = controller;
    };
    ControllerManager.prototype.get = function (name) {
        if (!this._lookup[name])
            throw new Error("Controller '" + name + "' is not registered");
        return this._lookup[name];
    };
    return ControllerManager;
}());
exports.ControllerManager = ControllerManager;
var ComponentInserter = (function () {
    function ComponentInserter(componentFactory, controllerManager, rootController) {
        this._controllerManager = controllerManager;
        this._componentFactory = componentFactory;
        this._rootController = rootController;
        this._rootElement = rootController.view.node;
    }
    ComponentInserter.prototype.insertComponents = function () {
        var walker = this._createWalker();
        var currentNode = null;
        try {
            currentNode = walker.nextNode();
        }
        catch (err) {
            console.error(err);
            throw err;
        }
        while (currentNode) {
            var nodeToProcess = currentNode;
            try {
                walker.currentNode = this._processElement(nodeToProcess);
            }
            catch (err) {
                console.error(err);
            }
            currentNode = walker.nextNode();
        }
    };
    ComponentInserter.prototype._createWalker = function () {
        var document = this._rootElement.ownerDocument;
        var filter = {
            acceptNode: function (node) {
                var element = node;
                return (element.tagName.substr(0, 4) == "OWL:") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        };
        return document.createTreeWalker(this._rootElement, NodeFilter.SHOW_ELEMENT, filter, false);
    };
    ComponentInserter.prototype._processElement = function (element) {
        var name = this._getComponentName(element);
        var componentController = this._componentFactory.createComponentInstance(name, element);
        element.parentElement.replaceChild(componentController.view.node, element);
        componentController.repaint();
        if (componentController.id)
            this._controllerManager.registerComponent(componentController);
        bindStaticEvents(componentController, element);
        componentController.initialize();
        if (!componentController.parent)
            console.log(componentController);
        return componentController.view.node;
    };
    ComponentInserter.prototype._getComponentName = function (element) {
        var nameParts = element.tagName.substr(4).toLowerCase().split("-");
        var result = nameParts[0];
        for (var i = 1; i < nameParts.length; ++i) {
            result += nameParts[i].charAt(0).toUpperCase() + nameParts[i].substr(1);
        }
        return result;
    };
    return ComponentInserter;
}());
exports.ComponentInserter = ComponentInserter;
var ControllerBase = (function (_super) {
    __extends(ControllerBase, _super);
    function ControllerBase(type) {
        var _this = _super.call(this) || this;
        _this._type = type;
        _this._internalId = ControllerBase._NEXT_ID++;
        _this._view = null;
        _this._serviceManager = null;
        _this._domEventGateway = null;
        _this._parent = null;
        _this._children = new Array();
        return _this;
    }
    ControllerBase.prototype.setup = function (renderedContent, options) {
        this._view = renderedContent;
        this._id = options[ControllerBase.OPT_ID] || null;
        this._setupGateway();
        this._setupTracking();
        this._controllerManager = this._serviceManager.getServiceByPath("owl.controllerManager");
        this._sizeWatchdog = new dom_utils_1.PropertyWatchdog(this, this._createWatchdogEventFactory(ControllerBase.EVENT_RESIZE), this._view.rootNode.node, ["offsetWidth", "offsetHeight"]);
    };
    ControllerBase.prototype.initialize = function () {
        this._dispatchTrackingSignal();
        this.repaint();
    };
    ControllerBase.prototype.repaint = function () {
        this._dispatchLocalEvent(ControllerBase.EVENT_REPAING);
        this._sizeWatchdog.watch();
    };
    ControllerBase.prototype.getSupportedEvents = function () {
        return [];
    };
    ControllerBase.prototype._dispatchLocalEvent = function (eventType, data) {
        if (data === void 0) { data = null; }
        var evt = new events_1.OwlEvent(eventType, data);
        this.dispatchEvent(evt);
    };
    ControllerBase.prototype._onTrackingReceived = function (evt) {
    };
    ControllerBase.prototype._onTracked = function (evt) {
    };
    ControllerBase.prototype._createWatchdogEventFactory = function (evtType) {
        return function (dispatcher, diff) { return new events_1.OwlEvent(evtType); };
    };
    ControllerBase.prototype._dispatchTrackingSignal = function () {
        var evt = new CustomEvent(ControllerBase.EVENT_TRACKING_SIGNAL, { detail: this, "bubbles": true });
        this._view.rootNode.node.dispatchEvent(evt);
    };
    ControllerBase.prototype._setupGateway = function () {
        this._domEventGateway = new DomEventGateway(this);
        this._domEventGateway.listenForEnumeratedEvents(this.getSupportedEvents());
    };
    ControllerBase.prototype._setupTracking = function () {
        var self = this;
        this._view.rootNode.node.addEventListener(ControllerBase.EVENT_TRACKING_SIGNAL, function (evt) {
            var realEvt = evt;
            var sender = realEvt.detail;
            if (sender._internalId != self._internalId) {
                evt.stopPropagation();
                if (sender._parent && sender._parent != self) {
                    sender._parent._removeChild(sender);
                }
                sender._parent = self;
                if (self._children.indexOf(sender) == -1)
                    self._children.push(sender);
                self._onTrackingReceived(realEvt);
                var trackedEvt = new CustomEvent(ControllerBase.EVENT_TRACKED, { "detail": self });
                sender._onTracked(trackedEvt);
            }
            return true;
        });
    };
    ControllerBase.prototype._removeChild = function (child) {
        if (child._parent == this) {
            var index = this._children.indexOf(child);
            if (index != -1)
                this._children.splice(index, 1);
            child._parent = null;
        }
    };
    Object.defineProperty(ControllerBase.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "view", {
        get: function () {
            return this._view.rootNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "serviceManager", {
        get: function () {
            return this._serviceManager;
        },
        set: function (val) {
            this._serviceManager = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (val) {
            this._renderer = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "controllerManager", {
        get: function () {
            return this._controllerManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControllerBase.prototype, "children", {
        get: function () {
            return this._children.slice(0, this._children.length);
        },
        enumerable: true,
        configurable: true
    });
    ControllerBase.EVENT_CLICK = "click";
    ControllerBase.EVENT_RESIZE = "resize";
    ControllerBase.EVENT_REPAING = "repaint";
    ControllerBase.EVENT_TRACKING_SIGNAL = "tracking_signal";
    ControllerBase.EVENT_TRACKED = "tracked";
    ControllerBase.OPT_ID = "id";
    ControllerBase._NEXT_ID = 1;
    return ControllerBase;
}(events_1.EventDispatcher));
exports.ControllerBase = ControllerBase;
var DomEventGateway = (function () {
    function DomEventGateway(controller) {
        this._controller = controller;
        this._rootNode = controller.view;
        this._managedEventTypes = new Array();
    }
    DomEventGateway.prototype.listenForEnumeratedEvents = function (eventTypes) {
        var _this = this;
        eventTypes.forEach(function (type) {
            _this.listenForEvent(type);
        });
    };
    DomEventGateway.prototype.listenForEvent = function (eventType) {
        var _this = this;
        this._rootNode.addEventListener(eventType, function (evt) { _this._handleEvent(evt); });
    };
    DomEventGateway.prototype._handleEvent = function (event) {
        var wrappedEvent = new events_1.DomEvent(event);
        this._controller.dispatchEvent(wrappedEvent);
    };
    return DomEventGateway;
}());
exports.DomEventGateway = DomEventGateway;
function registerFunctionFactory(baseNs, name, renderer, controller) {
    return function (cm, sm) {
        var rendererName = baseNs + ".renderer";
        var controllerName = baseNs + ".controller";
        sm.registerService(rendererName, function () { return new renderer(); }, false);
        sm.registerService(controllerName, function () { return new controller(name); }, false);
        var dsc = new ComponentDescription(name, rendererName, controllerName);
        cm.registerComponent(dsc);
    };
}
exports.registerFunctionFactory = registerFunctionFactory;
function bindStaticEvents(controller, originalNode) {
    for (var i = 0; i < originalNode.attributes.length; ++i) {
        var attr = originalNode.attributes.item(i);
        if (isStaticEvent(attr)) {
            var eventType = getStaticEventType(attr);
            var expr = attr.value;
            var handler = createStaticEventHandler(expr, controller);
            controller.addEventListener(eventType, handler);
        }
    }
}
exports.bindStaticEvents = bindStaticEvents;
function isStaticEvent(attr) {
    return attr.name.substr(0, 5) == "hoot:";
}
function getStaticEventType(attr) {
    return attr.name.substr(5);
}
function createStaticEventHandler(expr, context) {
    var result = new Function("$event", expr);
    return result.bind(context);
}
var ComponentLookup = (function () {
    function ComponentLookup() {
    }
    return ComponentLookup;
}());
var ControllerLookup = (function () {
    function ControllerLookup() {
    }
    return ControllerLookup;
}());


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var AbstractRenderer = (function () {
    function AbstractRenderer() {
    }
    AbstractRenderer.prototype.getLastResult = function () {
        return this._lastResult;
    };
    AbstractRenderer.prototype.getOptions = function (originalNode) {
        var result = new Object();
        if (originalNode instanceof dom_1.CommonHtmlElement) {
            var element = originalNode;
            var attributes = element.attributes.getIterator();
            for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
                var attr = attributes_1[_i];
                result[attr.name] = attr.value;
            }
            result["id"] = this._getAttributeValue(originalNode, "id");
            result["classes"] = element.styles.getClasses();
        }
        return result;
    };
    AbstractRenderer.prototype._processRenderResult = function (result) {
        this._lastResult = result;
    };
    AbstractRenderer.prototype._setupId = function (target, options) {
        if (options["id"])
            target.attributes.set("id", options["id"]);
    };
    AbstractRenderer.prototype._setupClassNames = function (target, options) {
        if (options["classes"])
            for (var _i = 0, _a = options["classes"]; _i < _a.length; _i++) {
                var className = _a[_i];
                target.styles.addClass(className);
            }
    };
    AbstractRenderer.prototype._getAttributeValue = function (element, name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var result = defaultValue;
        if (element.attributes.has(name))
            result = element.attributes.get(name).value;
        return result;
    };
    AbstractRenderer.prototype._copyContent = function (source, target) {
        for (var _i = 0, _a = source.chidlren; _i < _a.length; _i++) {
            var c = _a[_i];
            target.append(c);
        }
    };
    return AbstractRenderer;
}());
exports.AbstractRenderer = AbstractRenderer;
var RenderResult = (function () {
    function RenderResult(rootNode, entryNodes) {
        this._rootNode = rootNode;
        this._entryNodes = entryNodes;
    }
    RenderResult.prototype.getEntry = function (name) {
        this._assertEntryExists(name);
        return this._entryNodes[name];
    };
    Object.defineProperty(RenderResult.prototype, "rootNode", {
        get: function () {
            return this._rootNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderResult.prototype, "rootElement", {
        get: function () {
            return this._rootNode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderResult.prototype, "entryNodes", {
        get: function () {
            return this._entryNodes;
        },
        enumerable: true,
        configurable: true
    });
    RenderResult.prototype._assertEntryExists = function (name) {
        if (!this._entryNodes[name])
            throw new Error("Entry node '" + name + "' does not exist");
    };
    return RenderResult;
}());
exports.RenderResult = RenderResult;
var EntryNodeLookup = (function () {
    function EntryNodeLookup() {
    }
    return EntryNodeLookup;
}());
exports.EntryNodeLookup = EntryNodeLookup;


/***/ }),
/* 2 */
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
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(8);
var rendering_1 = __webpack_require__(1);
var VisualComponentController = (function (_super) {
    __extends(VisualComponentController, _super);
    function VisualComponentController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VisualComponentController.prototype.getSupportedEvents = function () {
        return ["click", "mouseenter"];
    };
    return VisualComponentController;
}(component_1.ControllerBase));
exports.VisualComponentController = VisualComponentController;
var DynamicSizeController = (function (_super) {
    __extends(DynamicSizeController, _super);
    function DynamicSizeController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DynamicSizeController.prototype._onTracked = function (evt) {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    };
    DynamicSizeController.prototype._onTrackingReceived = function (evt) {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    };
    DynamicSizeController.prototype._bindResizeEventListener = function (observedController) {
        var _this = this;
        observedController.addEventListener(component_1.ControllerBase.EVENT_RESIZE, function () {
            _this.repaint();
        });
    };
    return DynamicSizeController;
}(VisualComponentController));
exports.DynamicSizeController = DynamicSizeController;
var SizeableController = (function (_super) {
    __extends(SizeableController, _super);
    function SizeableController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SizeableController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._setupSizer(options);
    };
    SizeableController.prototype.repaint = function () {
        this._sizer.updateSize();
        _super.prototype.repaint.call(this);
    };
    SizeableController.prototype._setupSizer = function (options) {
        var _this = this;
        var sizerType = options["sizer"];
        if (!sizerType)
            sizerType = "auto";
        var sizerFactory = this.serviceManager.getServiceByPath("owl.sizerFactory");
        var sizer = sizerFactory.getSizer(sizerType);
        sizer.setup(this._view.rootNode, options);
        this._sizer = sizer;
        this._sizer.updateSize();
        this._sizer.addEventListener(base_1.ASizer.EVENT_RESIZE, function (evt) { _this.repaint(); });
    };
    return SizeableController;
}(DynamicSizeController));
exports.SizeableController = SizeableController;
var ContainerController = (function (_super) {
    __extends(ContainerController, _super);
    function ContainerController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ContainerController;
}(SizeableController));
exports.ContainerController = ContainerController;
var ContainerRenderer = (function (_super) {
    __extends(ContainerRenderer, _super);
    function ContainerRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContainerRenderer.prototype.setLayout = function (layoutType) {
        var itemContainer = this._getMainItemContainer();
        var layoutClass;
        switch (layoutType) {
            case "row":
                layoutClass = "owl-layout-row";
                break;
            case "row-reverse":
                layoutClass = "owl-layout-rrow";
                break;
            case "column":
                layoutClass = "owl-layout-column";
                break;
            case "column-reverse":
                layoutClass = "owl-layout-rcolumn";
                break;
            default:
                throw new Error("Invalid layout type '" + layoutType + "'");
        }
        itemContainer.styles.addClass(layoutClass);
    };
    ContainerRenderer.prototype.setMainPosition = function (position) {
        this._setPositionClass(position, "main");
    };
    ContainerRenderer.prototype.setCrossPosition = function (position) {
        this._setPositionClass(position, "cross");
    };
    ContainerRenderer.prototype._setupLayout = function (options) {
        var layoutType = options["layout"];
        if (layoutType) {
            var mainPosition = options["layout-main"];
            var crossPosition = options["layout-cross"];
            this.setLayout(layoutType);
            if (mainPosition)
                this.setMainPosition(mainPosition);
            if (crossPosition)
                this.setCrossPosition(crossPosition);
        }
    };
    ContainerRenderer.prototype._setPositionClass = function (positionType, direction) {
        var target = this._getMainItemContainer();
        var className = this._getPositionBaseClassName(direction, positionType);
        target.styles.addClass(className);
    };
    ContainerRenderer.prototype._getPositionBaseClassName = function (direction, positionType) {
        return "owl-layout-position-" + direction + "-" + positionType;
    };
    return ContainerRenderer;
}(rendering_1.AbstractRenderer));
exports.ContainerRenderer = ContainerRenderer;


/***/ }),
/* 3 */
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
        var fragment = parser.parseFromString(html, "text/html");
        var element = fragment.body.firstChild;
        return this.mapNode(element);
    };
    DomManipulator.prototype.createAttribute = function (name, value) {
        if (value === void 0) { value = null; }
        var attr = this.rootElement.element.ownerDocument.createAttribute(name);
        attr.value = value;
        return this.mapNode(attr);
    };
    DomManipulator.prototype.createElement = function (tagName) {
        var element = this.window.document.createElement(tagName);
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
var AttributeManager = (function () {
    function AttributeManager(element, manipulator) {
        this._attributes = element.attributes;
        this._originalElement = element;
        this._manipulator = manipulator;
    }
    AttributeManager.prototype.get = function (name) {
        var attr = this._attributes.getNamedItem(name);
        if (!attr)
            throw new Error("Attribute '" + name + "' is not set");
        return this._manipulator.mapNode(attr);
    };
    AttributeManager.prototype.has = function (name) {
        return !!this._attributes.getNamedItem(name);
    };
    AttributeManager.prototype.set = function (name, value) {
        var attr = this._attributes.getNamedItem(name);
        if (attr)
            attr.value = value;
        else {
            this._originalElement.setAttribute(name, value);
        }
    };
    AttributeManager.prototype.toCommonNodeList = function () {
        var result = CommonNodeList.createInstance();
        for (var i = 0; i < this._attributes.length; ++i) {
            result.push(this._manipulator.mapNode(this._attributes.item(i)));
        }
        return result;
    };
    AttributeManager.prototype.getIterator = function () {
        var result = new Array();
        for (var i = 0; i < this._attributes.length; ++i) {
            var attr = this._attributes.item(i);
            result.push(this._manipulator.mapNode(attr));
        }
        return result;
    };
    return AttributeManager;
}());
var StyleManager = (function () {
    function StyleManager(element) {
        this._styles = element.style;
        this._classes = element.classList;
    }
    StyleManager.prototype.addClass = function (className) {
        this._classes.add(className);
    };
    StyleManager.prototype.getClasses = function () {
        var result = new Array();
        for (var i = 0; i < this._classes.length; ++i)
            result.push(this._classes.item(i));
        return result;
    };
    StyleManager.prototype.removeClass = function (className) {
        this._classes.remove(className);
    };
    StyleManager.prototype.set = function (name, val) {
        this._styles[name] = val;
    };
    StyleManager.prototype.get = function (name) {
        return this._styles[name];
    };
    return StyleManager;
}());
var CommonHtmlNode = (function () {
    function CommonHtmlNode(node, manipulator) {
        this._node = node;
        this._domManipulator = manipulator;
    }
    CommonHtmlNode.prototype.addEventListener = function (eventType, handler) {
        this.node.addEventListener(eventType, handler);
    };
    Object.defineProperty(CommonHtmlNode.prototype, "node", {
        get: function () {
            return this._node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlNode.prototype, "parent", {
        get: function () {
            return this._domManipulator.mapNode(this._node.parentNode);
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
        var _this = _super.call(this, node, manipulator) || this;
        _this._attributes = null;
        _this._styleManager = null;
        _this._attributes = new AttributeManager(_this.element, manipulator);
        _this._styleManager = new StyleManager(_this.element);
        return _this;
    }
    CommonHtmlElement.prototype.append = function (node) {
        this.element.appendChild(node.node);
    };
    CommonHtmlElement.prototype.insertOnIndex = function (node, index) {
        if (index < 0 || index >= this.element.childNodes.length)
            throw new Error("Invalid index '" + index + "'");
        var refNode = this.element.childNodes.item(index);
        this.element.parentNode.insertBefore(node.node, refNode);
    };
    CommonHtmlElement.prototype.insertBeforeNode = function (node, refNode) {
        if (refNode.parent !== this)
            throw new Error("Invalid subtree");
        this.node.insertBefore(node.node, refNode.node);
    };
    Object.defineProperty(CommonHtmlElement.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlElement.prototype, "styles", {
        get: function () {
            return this._styleManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlElement.prototype, "size", {
        get: function () {
            return new Size(this.element.offsetWidth, this.element.offsetHeight);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommonHtmlElement.prototype, "position", {
        get: function () {
            return new Position(this.element.offsetLeft, this.element.offsetTop);
        },
        enumerable: true,
        configurable: true
    });
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
            var result = CommonNodeList.createInstance();
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
        return _super.call(this) || this;
    }
    CommonNodeList.createInstance = function () {
        return Object.create(CommonNodeList.prototype);
    };
    CommonNodeList.prototype.getFirst = function () {
        if (this.length == 0)
            throw new Error("The list is empty");
        return this[0];
    };
    CommonNodeList.prototype.getLast = function () {
        if (this.length == 0)
            throw new Error("The list is empty");
        return this[this.length - 1];
    };
    return CommonNodeList;
}(Array));
exports.CommonNodeList = CommonNodeList;
var Position = (function () {
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    return Position;
}());
exports.Position = Position;
var Size = (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    return Size;
}());
exports.Size = Size;


/***/ }),
/* 4 */
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
        });
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
/* 5 */
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
var OwlEvent = (function () {
    function OwlEvent(type, data) {
        if (data === void 0) { data = null; }
        this.type = type;
        this._propagate = true;
        this.data = data;
    }
    Object.defineProperty(OwlEvent.prototype, "propagate", {
        get: function () {
            return this._propagate;
        },
        set: function (val) {
            this._propagate = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlEvent.prototype, "target", {
        get: function () {
            return this._target;
        },
        set: function (val) {
            if (this._target)
                throw new Error("Target can not be changed");
            this._target = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlEvent.prototype, "currentTarget", {
        get: function () {
            return this._currentTarget;
        },
        set: function (val) {
            this._currentTarget = val;
        },
        enumerable: true,
        configurable: true
    });
    return OwlEvent;
}());
exports.OwlEvent = OwlEvent;
var DomEvent = (function (_super) {
    __extends(DomEvent, _super);
    function DomEvent(evt, data) {
        if (data === void 0) { data = null; }
        var _this = _super.call(this, evt.type, data) || this;
        _this.originalEvent = evt;
        return _this;
    }
    return DomEvent;
}(OwlEvent));
exports.DomEvent = DomEvent;
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._queue = new Array();
        this._handlers = new EventHandlerLookup();
        this._inDispatchProcess = false;
    }
    EventDispatcher.prototype.dispatchEvent = function (evt) {
        evt.target = this;
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
        evt.currentTarget = this;
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var service_management_1 = __webpack_require__(4);
var ModuleManager = (function () {
    function ModuleManager() {
        this._modules = new Array();
    }
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
        this._remainingDependencies = new Array();
    }
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
    function DependencyResolvingRecord(name, dependencies) {
        this.name = name;
        this.dependencies = new Array();
        this.addDependencies(dependencies);
    }
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


/***/ }),
/* 7 */
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
var rendering_1 = __webpack_require__(1);
var base_1 = __webpack_require__(2);
var ButtonRendererBase = (function (_super) {
    __extends(ButtonRendererBase, _super);
    function ButtonRendererBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonRendererBase.prototype.render = function (originalNode, manipulator, options) {
        var wrapper = this._renderWrapper(originalNode, manipulator, options);
        var button = this._renderButton(originalNode, manipulator, options);
        this._setupClassNames(wrapper.rootNode, options);
        this._insertButtonToWrapper(button, wrapper.entryNodes);
        this._setupLookup(button, wrapper.entryNodes);
        this._setupId(button, options);
        this._processRenderResult(wrapper);
        return wrapper;
    };
    ButtonRendererBase.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");
        return result;
    };
    ButtonRendererBase.prototype._insertButtonToWrapper = function (button, wrapperLookup) {
        wrapperLookup["inner"].append(button);
    };
    ButtonRendererBase.prototype._setupLookup = function (button, wrapperLookup) {
        wrapperLookup["button"] = button;
        wrapperLookup["label"] = button.chidlren.getFirst();
    };
    ButtonRendererBase.prototype._renderWrapper = function (originalNode, manipulator, options) {
        var wrapper = manipulator.createNewFragment(ButtonRendererBase.CONTAINER_TEMPLATE);
        var entryNodes = new rendering_1.EntryNodeLookup();
        entryNodes["outer"] = wrapper;
        entryNodes["inner"] = wrapper.chidlren.getFirst();
        var result = new rendering_1.RenderResult(wrapper, entryNodes);
        return result;
    };
    ButtonRendererBase.CONTAINER_TEMPLATE = "<span class='owl-button-outer'><span class='owl-button-inner'></span></span>";
    ButtonRendererBase.ENTRY_LABEL = "label";
    return ButtonRendererBase;
}(rendering_1.AbstractRenderer));
exports.ButtonRendererBase = ButtonRendererBase;
var ButtonController = (function (_super) {
    __extends(ButtonController, _super);
    function ButtonController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._label = renderedContent.getEntry(ButtonRendererBase.ENTRY_LABEL);
        this.label = options["label"] || this.label;
    };
    Object.defineProperty(ButtonController.prototype, "label", {
        get: function () {
            return this._label.content;
        },
        set: function (val) {
            this._label.content = val;
        },
        enumerable: true,
        configurable: true
    });
    return ButtonController;
}(base_1.VisualComponentController));
exports.ButtonController = ButtonController;


/***/ }),
/* 8 */
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
var events_1 = __webpack_require__(5);
var SizerFactory = (function () {
    function SizerFactory() {
        this._sizers = new SizerLookup();
    }
    SizerFactory.prototype.addSizer = function (name, factory) {
        if (this._sizers[name])
            throw new Error("Sizer '" + name + "' does exist.");
        this._sizers[name] = factory;
    };
    SizerFactory.prototype.getSizer = function (name) {
        if (!this._sizers[name])
            throw new Error("Sizer '" + name + "' does not exist.");
        return this._sizers[name]();
    };
    return SizerFactory;
}());
exports.SizerFactory = SizerFactory;
var ASizer = (function (_super) {
    __extends(ASizer, _super);
    function ASizer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._oldWidth = 0;
        _this._oldHeight = 0;
        return _this;
    }
    ASizer.prototype.setup = function (node, options) {
        this._node = node;
        this._options = options;
    };
    ASizer.prototype.teardown = function () {
    };
    ASizer.prototype._dispatchResizeEventIfChanged = function (newWidth, newHeight) {
        if (this._oldWidth != newWidth || this._oldHeight != newHeight) {
            this._oldWidth = newWidth;
            this._oldHeight = newHeight;
            var event_1 = new events_1.OwlEvent(ASizer.EVENT_RESIZE);
            this.dispatchEvent(event_1);
        }
    };
    ASizer.EVENT_RESIZE = "resize";
    return ASizer;
}(events_1.EventDispatcher));
exports.ASizer = ASizer;
var Auto = (function (_super) {
    __extends(Auto, _super);
    function Auto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Auto.prototype.updateSize = function () {
    };
    return Auto;
}(ASizer));
exports.Auto = Auto;
var FitParent = (function (_super) {
    __extends(FitParent, _super);
    function FitParent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FitParent.prototype.updateSize = function () {
        var parent = this._getOffsetParent();
        var element = this._node;
        var styles = element.styles;
        ;
        styles.set("height", parent.clientHeight + "px");
        this._dispatchResizeEventIfChanged(parent.clientWidth, parent.clientHeight);
    };
    FitParent.prototype.setup = function (node, options) {
        var _this = this;
        _super.prototype.setup.call(this, node, options);
        this._callback = function () { _this.updateSize(); };
        node.styles.addClass("owl-sizer-fitparent");
        window.addEventListener("resize", this._callback);
    };
    FitParent.prototype.teardown = function () {
        window.removeEventListener("resize", this._callback);
    };
    FitParent.prototype._getOffsetParent = function () {
        var parent = this._node.node.offsetParent;
        if (parent == null)
            parent = this._node.node.parentElement;
        if (parent == null)
            throw new Error("Parent was not found");
        return parent;
    };
    return FitParent;
}(ASizer));
exports.FitParent = FitParent;
var FitWindow = (function (_super) {
    __extends(FitWindow, _super);
    function FitWindow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FitWindow.prototype.updateSize = function () {
        var element = this._node;
        element.styles.set("width", window.innerWidth + "px");
        element.styles.set("height", window.innerHeight + "px");
        this._dispatchResizeEventIfChanged(window.innerWidth, window.innerHeight);
    };
    FitWindow.prototype.setup = function (node, options) {
        var _this = this;
        _super.prototype.setup.call(this, node, options);
        this._callback = function () { _this.updateSize(); };
        window.addEventListener("resize", this._callback);
    };
    FitWindow.prototype.teardown = function () {
        window.removeEventListener("resize", this._callback);
    };
    return FitWindow;
}(ASizer));
exports.FitWindow = FitWindow;
var SizerLookup = (function () {
    function SizerLookup() {
    }
    return SizerLookup;
}());


/***/ }),
/* 9 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var BaseBoxRenderer = (function (_super) {
    __extends(BaseBoxRenderer, _super);
    function BaseBoxRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseBoxRenderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(BaseBoxRenderer.TEMPLATE);
        var entryNodes = new rendering_1.EntryNodeLookup();
        var originalElement = originalNode;
        this._setupClassNames(rootNode, options);
        this._copyContent(originalNode, rootNode);
        this._setupId(rootNode, options);
        var result = new rendering_1.RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);
        this._setupLayout(options);
        return result;
    };
    BaseBoxRenderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["sizer"] = _super.prototype._getAttributeValue.call(this, originalNode, "sizer", "auto");
        this._setupContainerLayout(result);
        return result;
    };
    BaseBoxRenderer.prototype._getMainItemContainer = function () {
        return this._lastResult.rootElement;
    };
    BaseBoxRenderer.TEMPLATE = "<div class='owl-layout-fill-cross'></div>";
    return BaseBoxRenderer;
}(base_1.ContainerRenderer));
exports.BaseBoxRenderer = BaseBoxRenderer;
var BaseBoxController = (function (_super) {
    __extends(BaseBoxController, _super);
    function BaseBoxController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseBoxController.prototype._onTrackingReceived = function (evt) {
        this.repaint();
    };
    BaseBoxController.prototype._onTracked = function (evt) {
        var _this = this;
        var senderController = evt.detail;
        senderController.addEventListener(component_1.ControllerBase.EVENT_RESIZE, function () {
            _this.repaint();
        });
        this.repaint();
    };
    return BaseBoxController;
}(base_1.ContainerController));
exports.BaseBoxController = BaseBoxController;
var BaseBoxItemRenderer = (function (_super) {
    __extends(BaseBoxItemRenderer, _super);
    function BaseBoxItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseBoxItemRenderer.prototype.render = function (originalNode, manipulator, options) {
        var root = manipulator.createNewFragment(BaseBoxItemRenderer.TEMPLATE);
        var entries = new rendering_1.EntryNodeLookup();
        var result = new rendering_1.RenderResult(root, entries);
        this._setupContainerClasses(root);
        this._copyContent(originalNode, root);
        this._setupId(root, options);
        this._setupClassNames(root, options);
        this._processRenderResult(result);
        return result;
    };
    BaseBoxItemRenderer.prototype.getOptions = function (originalNode) {
        var options = _super.prototype.getOptions.call(this, originalNode);
        options["size"] = this._getAttributeValue(originalNode, "size", "auto");
        return options;
    };
    BaseBoxItemRenderer.TEMPLATE = "<div class='owl-box-item'></div>";
    return BaseBoxItemRenderer;
}(rendering_1.AbstractRenderer));
exports.BaseBoxItemRenderer = BaseBoxItemRenderer;
var BaseBoxItemController = (function (_super) {
    __extends(BaseBoxItemController, _super);
    function BaseBoxItemController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseBoxItemController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._size = options["size"];
    };
    BaseBoxItemController.prototype.repaint = function () {
        _super.prototype.repaint.call(this);
        if (this._oldSize != this._size) {
            this._updateSize();
        }
    };
    BaseBoxItemController.prototype.setRealSize = function (size) {
        this._view.rootElement.styles.set("height", size);
        this.repaint();
    };
    BaseBoxItemController.prototype._onTracked = function (evt) {
        var _this = this;
        var senderController = evt.detail;
        senderController.addEventListener(component_1.ControllerBase.EVENT_RESIZE, function () {
            _this.repaint();
        });
        this.repaint();
    };
    BaseBoxItemController.prototype._updateSize = function () {
        var oldClass = this._getClassBySize(this._oldSize);
        var newClass = this._getClassBySize(this._size);
        if (oldClass)
            this._view.rootElement.styles.removeClass(oldClass);
        if (newClass)
            this._view.rootElement.styles.addClass(newClass);
        this._oldSize = this._size;
    };
    BaseBoxItemController.prototype._getClassBySize = function (sizeType) {
        switch (sizeType) {
            case "content":
                return "owl-box-size-content";
            default:
                return null;
        }
    };
    Object.defineProperty(BaseBoxItemController.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    return BaseBoxItemController;
}(component_1.ControllerBase));
exports.BaseBoxItemController = BaseBoxItemController;


/***/ }),
/* 10 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var result = this._render(originalNode, manipulator, options);
        this._setupClassNames(result.rootNode, options);
        return result;
    };
    Renderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "label");
        return result;
    };
    Renderer.prototype._render = function (originalNode, manipulator, options) {
        var button = manipulator.createNewFragment(Renderer.LABEL_TEMPLATE);
        var entryNodes = new rendering_1.EntryNodeLookup();
        entryNodes["label"] = button.chidlren.getFirst();
        var result = new rendering_1.RenderResult(button, entryNodes);
        return result;
    };
    Renderer.LABEL_TEMPLATE = "<span>label</span>";
    Renderer.ENTRY_LABEL = "label";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ;
    Controller.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._label = renderedContent.getEntry(Renderer.ENTRY_LABEL);
        this.label = options["label"] || this.label;
    };
    Object.defineProperty(Controller.prototype, "label", {
        get: function () {
            return this._label.content;
        },
        set: function (val) {
            this._label.content = val;
        },
        enumerable: true,
        configurable: true
    });
    return Controller;
}(component_1.ControllerBase));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.text_label", "owlTextLabel", Renderer, Controller);


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(12);
__webpack_require__(5);
__webpack_require__(3);
__webpack_require__(6);
module.exports = __webpack_require__(4);


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var service_management_1 = __webpack_require__(4);
var modules_1 = __webpack_require__(6);
var register_1 = __webpack_require__(13);
var component_1 = __webpack_require__(0);
var factory_1 = __webpack_require__(28);
var application_1 = __webpack_require__(29);
var OwlWebLib = (function () {
    function OwlWebLib() {
        this._serviceManager = new service_management_1.ServiceManager();
        this._moduleManager = new modules_1.ModuleManager();
        this._controllerManager = new component_1.ControllerManager();
        this._sizerFactory = factory_1.sizerFactory();
        this._domManipulator = null;
        this._componentFactory = null;
    }
    OwlWebLib.prototype.addMoudle = function (name, dependencies, factory) {
        this._moduleManager.addModule(name, dependencies, factory);
    };
    OwlWebLib.prototype.run = function (window, rootElement) {
        this._rootElement = rootElement;
        this._application = new application_1.Application();
        this._window = window;
        this._initialize();
        this._componentInserter.insertComponents();
    };
    Object.defineProperty(OwlWebLib.prototype, "serviceManager", {
        get: function () {
            return this._serviceManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlWebLib.prototype, "domManipulator", {
        get: function () {
            return this._domManipulator;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlWebLib.prototype, "componentManager", {
        get: function () {
            return this._componentFactory;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlWebLib.prototype, "rootElement", {
        get: function () {
            return this._rootElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlWebLib.prototype, "window", {
        get: function () {
            return this._window;
        },
        enumerable: true,
        configurable: true
    });
    OwlWebLib.prototype._initialize = function () {
        this._initializeMembers();
        this._initializeCommonServices();
        this._initializeComponents();
        this._initializeApplication();
        this._initializeInserter();
        this._moduleManager.initializeModules(this._serviceManager);
    };
    OwlWebLib.prototype._initializeMembers = function () {
        this._domManipulator = new dom_1.DomManipulator(this._window, this._rootElement);
        this._componentFactory = new component_1.ComponentFactory(this._serviceManager, this._domManipulator);
    };
    OwlWebLib.prototype._initializeCommonServices = function () {
        var _this = this;
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_APPLICATION, function () { return _this; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_DOM_MANIPULATOR, function () { return _this._domManipulator; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_COMPONENT_MANAGER, function () { return _this._componentFactory; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_SIZER_MANAGER, function () { return _this._sizerFactory; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_CONTROLLER_MANAGER, function () { return _this._controllerManager; });
    };
    OwlWebLib.prototype._initializeComponents = function () {
        register_1.register(this._componentFactory, this._serviceManager);
    };
    OwlWebLib.prototype._initializeApplication = function () {
        this._application.serviceManager = this._serviceManager;
        this._application.setupApplication(this._domManipulator.mapNode(this._rootElement));
    };
    OwlWebLib.prototype._initializeInserter = function () {
        this._componentInserter = new component_1.ComponentInserter(this._componentFactory, this._controllerManager, this._application);
    };
    OwlWebLib.SERVICE_PREFIX_APPLICATION = "owl.application";
    OwlWebLib.SERVICE_PREFIX_DOM_MANIPULATOR = "owl.domManipulator";
    OwlWebLib.SERVICE_PREFIX_COMPONENT_MANAGER = "owl.componentManager";
    OwlWebLib.SERVICE_PREFIX_SIZER_MANAGER = "owl.sizerFactory";
    OwlWebLib.SERVICE_PREFIX_CONTROLLER_MANAGER = "owl.controllerManager";
    return OwlWebLib;
}());
exports.OwlWebLib = OwlWebLib;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Buttons = __webpack_require__(14);
var Layout = __webpack_require__(18);
var Container = __webpack_require__(24);
var TextLabel = __webpack_require__(10);
var TextBox = __webpack_require__(27);
function register(cm, sm) {
    Buttons.registerButtons(cm, sm);
    TextLabel.register(cm, sm);
    Layout.register(cm, sm);
    TextBox.register(cm, sm);
    Container.register(cm, sm);
}
exports.register = register;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SB = __webpack_require__(15);
var LB = __webpack_require__(17);
function registerButtons(cm, sm) {
    SB.register(cm, sm);
    LB.register(cm, sm);
}
exports.registerButtons = registerButtons;


/***/ }),
/* 15 */
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
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(7);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");
        return result;
    };
    Renderer.prototype._renderButton = function (originalNode, manipulator, options) {
        var button = manipulator.createNewFragment(Renderer.BUTTON_TEMPLATE);
        return button;
    };
    Renderer.prototype._setupLookup = function (button, wrapperLookup) {
        _super.prototype._setupLookup.call(this, button, wrapperLookup);
        wrapperLookup["href"] = button.attributes.get("href");
    };
    Renderer.BUTTON_TEMPLATE = "<button type='button' class='owl-button'>button</button>";
    return Renderer;
}(base_1.ButtonRendererBase));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Controller;
}(base_1.ButtonController));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.button.simple", "owlSimpleButton", Renderer, Controller);


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PropertyWatchdog = (function () {
    function PropertyWatchdog(dispatcher, eventFactory, watchedObject, watchedProperties) {
        var _this = this;
        this._dispatcher = dispatcher;
        this._eventFactory = eventFactory;
        this._watchedObject = watchedObject;
        this._lastData = new Object();
        watchedProperties.forEach(function (p) { _this._lastData[p] = watchedObject[p]; }, this);
    }
    PropertyWatchdog.prototype.watch = function () {
        var currentState = this._getCurrentState();
        var diff, changeFound;
        var result = this._resolveStatus(currentState);
        this._resolveResult(result);
        this._lastData = currentState;
    };
    PropertyWatchdog.prototype._getCurrentState = function () {
        var result = {};
        for (var p in this._lastData)
            result[p] = this._watchedObject[p];
        return result;
    };
    PropertyWatchdog.prototype._resolveStatus = function (newState) {
        var found = false;
        var diff = new Object();
        for (var k in newState) {
            if (newState[k] != this._lastData[k]) {
                found = true;
                diff[k] = new WatchChange(this._lastData[k], newState[k]);
            }
        }
        return new WatchResult(diff, found);
    };
    PropertyWatchdog.prototype._resolveResult = function (result) {
        if (result.changeFound) {
            var event_1 = this._eventFactory(this._dispatcher, result);
            this._dispatcher.dispatchEvent(event_1);
        }
    };
    return PropertyWatchdog;
}());
exports.PropertyWatchdog = PropertyWatchdog;
var WatchChange = (function () {
    function WatchChange(oldValue, newValue) {
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    return WatchChange;
}());
exports.WatchChange = WatchChange;
var WatchResult = (function () {
    function WatchResult(diff, changeFound) {
        this.diff = diff;
        this.changeFound = changeFound;
    }
    return WatchResult;
}());
exports.WatchResult = WatchResult;


/***/ }),
/* 17 */
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
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(7);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");
        result["href"] = this._getAttributeValue(originalNode, "href", "");
        return result;
    };
    Renderer.prototype._setupLookup = function (button, wrapperLookup) {
        _super.prototype._setupLookup.call(this, button, wrapperLookup);
        wrapperLookup["href"] = button.attributes.get("href");
    };
    Renderer.prototype._renderButton = function (originalNode, manipulator, options) {
        var button = manipulator.createNewFragment(Renderer.BUTTON_TEMPLATE);
        button.attributes.set("href", options["href"]);
        return button;
    };
    Renderer.BUTTON_TEMPLATE = "<a class='owl-button'>button</a>";
    return Renderer;
}(base_1.ButtonRendererBase));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Controller.prototype, "href", {
        get: function () {
            return this._view.getEntry("href").value;
        },
        enumerable: true,
        configurable: true
    });
    return Controller;
}(base_1.ButtonController));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.button.link", "owlLinkButton", Renderer, Controller);


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Viewport = __webpack_require__(19);
var Slider = __webpack_require__(20);
var VBox = __webpack_require__(21);
var HBox = __webpack_require__(22);
var FloatingBox = __webpack_require__(23);
function register(cf, sm) {
    Viewport.register(cf, sm);
    Slider.register(cf, sm);
    Slider.registerPage(cf, sm);
    VBox.register(cf, sm);
    VBox.registerItem(cf, sm);
    HBox.register(cf, sm);
    HBox.registerItem(cf, sm);
    FloatingBox.register(cf, sm);
}
exports.register = register;


/***/ }),
/* 19 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        var entryNodes = new rendering_1.EntryNodeLookup();
        this._setupClassNames(rootNode, options);
        while (originalNode.node.childNodes.length)
            rootNode.node.appendChild(originalNode.node.firstChild);
        var result = new rendering_1.RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);
        return result;
    };
    Renderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["sizer"] = _super.prototype._getAttributeValue.call(this, originalNode, "sizer");
        return result;
    };
    Renderer.TEMPLATE = "<div class='owl-viewport'></div>";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function (renderedContent, options) {
        this._setupDefaultOptions(options);
        _super.prototype.setup.call(this, renderedContent, options);
    };
    Controller.prototype._setupDefaultOptions = function (options) {
        options["sizer"] = options["sizer"] || "fitParent";
    };
    return Controller;
}(base_1.ContainerController));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.layout.viewport", "owlViewport", Renderer, Controller);


/***/ }),
/* 20 */
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
var rendering_1 = __webpack_require__(1);
var dom_1 = __webpack_require__(3);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        var entryNodes = new rendering_1.EntryNodeLookup();
        var originalElement = originalNode;
        this._copyContent(originalElement, rootNode);
        this._setupClassNames(rootNode, options);
        var result = new rendering_1.RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);
        return result;
    };
    Renderer.prototype.getOptions = function (originalNode) {
        var result = _super.prototype.getOptions.call(this, originalNode);
        result["sizer"] = _super.prototype._getAttributeValue.call(this, originalNode, "sizer");
        result["duration"] = _super.prototype._getAttributeValue.call(this, originalNode, "slide-duration");
        return result;
    };
    Renderer.TEMPLATE = "<div class='owl-slider'></div>";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.goto = function (pageName) {
        var container = this._getItemContainer();
        var targetItem = this._findItemByName(pageName);
        var targetScroll = this._getTargetPosition(targetItem);
        this._scroll(container, targetScroll);
    };
    Controller.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._duration = Number(options["duration"]);
    };
    Object.defineProperty(Controller.prototype, "duration", {
        get: function () {
            return this._duration;
        },
        set: function (val) {
            this._duration = val;
        },
        enumerable: true,
        configurable: true
    });
    Controller.prototype._onTracked = function (evt) {
        var _this = this;
        var senderController = evt.detail;
        senderController.addEventListener(component_1.ControllerBase.EVENT_RESIZE, function () {
            _this.repaint();
        });
        this.repaint();
    };
    Controller.prototype._getItemContainer = function () {
        return this._view.rootNode;
    };
    Controller.prototype._getCurrentScroll = function (itemContainer) {
        return itemContainer.element.scrollTop;
    };
    Controller.prototype._getTargetPosition = function (target) {
        return target.element.offsetTop;
    };
    Controller.prototype._scroll = function (container, targetValue) {
        if (this._duration == 0) {
            container.element.scrollTo(0, targetValue);
        }
        else {
            this._slideSmooth(container, targetValue);
        }
    };
    Controller.prototype._slideSmooth = function (container, target) {
        var timeLeft = this._duration;
        var timeStep = 1000 / 60;
        var timeSteps = this._duration / timeStep;
        var startScroll = container.element.scrollTop;
        var currentPosition = startScroll;
        var scrollLength = target - startScroll;
        var scrollStep = scrollLength / timeSteps;
        var iteration = 0;
        var tm = setInterval(function () {
            var delta = Math.abs(currentPosition - target);
            if (delta < Math.abs(scrollStep) || delta == 0) {
                container.element.scrollTo(0, target);
                clearInterval(tm);
                return;
            }
            ++iteration;
            currentPosition = startScroll + scrollStep * iteration;
            container.element.scrollTo(0, currentPosition);
            if (currentPosition < 0)
                clearInterval(tm);
        }, timeStep);
    };
    Controller.prototype._findItemByName = function (name) {
        var result = null;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var typedChild = child;
            if (typedChild.pageName == name) {
                result = typedChild.view;
            }
        }
        if (result === null)
            throw new Error("Page '" + name + "' not found");
        return result;
    };
    return Controller;
}(base_1.ContainerController));
exports.Controller = Controller;
var SliderPageRenderer = (function (_super) {
    __extends(SliderPageRenderer, _super);
    function SliderPageRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SliderPageRenderer.prototype.render = function (originalNode, manipulator, options) {
        var root = manipulator.createNewFragment(SliderPageRenderer.TEMPLATE);
        var entries = new rendering_1.EntryNodeLookup();
        entries["content"] = root;
        var result = new rendering_1.RenderResult(root, entries);
        this._copyContent(originalNode, root);
        this._setupId(root, options);
        this._setupClassNames(root, options);
        this._processRenderResult(result);
        return result;
    };
    SliderPageRenderer.prototype.getOptions = function (rootNode) {
        var result = _super.prototype.getOptions.call(this, rootNode);
        result["name"] = this._getAttributeValue(rootNode, "name", null);
        result["sizer"] = "fitParent";
        return result;
    };
    SliderPageRenderer.TEMPLATE = "<div class='owl-slider-page'></div>";
    return SliderPageRenderer;
}(rendering_1.AbstractRenderer));
exports.SliderPageRenderer = SliderPageRenderer;
var SliderPageController = (function (_super) {
    __extends(SliderPageController, _super);
    function SliderPageController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._overflowBehaviour = "hidden";
        return _this;
    }
    SliderPageController.prototype.repaint = function () {
        if (this._overflowBehaviour == "expand")
            this._view.entryNodes["content"].styles.addClass("owl-overflow-expand");
        _super.prototype.repaint.call(this);
    };
    SliderPageController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._pageName = options["name"];
        this._overflowBehaviour = options["overflow"] ? options["overflow"] : "hidden";
    };
    SliderPageController.prototype._onTracked = function (evt) {
        var _this = this;
        var controller = evt.detail;
        controller.addEventListener(component_1.ControllerBase.EVENT_RESIZE, function (evt) { _this.repaint(); });
    };
    SliderPageController.prototype._getContentSize = function () {
        var width = 0, height = 0;
        var root = this._view.entryNodes["content"];
        root.chidlren.forEach(function (child) {
            if (child instanceof dom_1.CommonHtmlElement) {
                var element = child;
                var maxX = element.size.width + element.position.x;
                var maxY = element.size.height + element.position.y;
                if (width < maxX)
                    width = maxX;
                if (height < maxY)
                    height = maxY;
            }
        });
        return new dom_1.Size(width, height);
    };
    Object.defineProperty(SliderPageController.prototype, "pageName", {
        get: function () {
            return this._pageName;
        },
        set: function (val) {
            this._pageName = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliderPageController.prototype, "overflowBehaviour", {
        get: function () {
            return this._overflowBehaviour;
        },
        enumerable: true,
        configurable: true
    });
    return SliderPageController;
}(base_1.VisualComponentController));
exports.SliderPageController = SliderPageController;
exports.register = component_1.registerFunctionFactory("owl.component.layout.slider", "owlSlider", Renderer, Controller);
exports.registerPage = component_1.registerFunctionFactory("owl.component.layout.slider_page", "owlSliderPage", SliderPageRenderer, SliderPageController);


/***/ }),
/* 21 */
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
var component_1 = __webpack_require__(0);
var vh_base_1 = __webpack_require__(9);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype._setupContainerLayout = function (options) {
        options["layout"] = "column";
    };
    return Renderer;
}(vh_base_1.BaseBoxRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Controller;
}(vh_base_1.BaseBoxController));
exports.Controller = Controller;
var BoxItemRenderer = (function (_super) {
    __extends(BoxItemRenderer, _super);
    function BoxItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxItemRenderer.prototype._setupContainerClasses = function (root) {
    };
    return BoxItemRenderer;
}(vh_base_1.BaseBoxItemRenderer));
exports.BoxItemRenderer = BoxItemRenderer;
var BoxItemController = (function (_super) {
    __extends(BoxItemController, _super);
    function BoxItemController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BoxItemController;
}(vh_base_1.BaseBoxItemController));
exports.BoxItemController = BoxItemController;
exports.register = component_1.registerFunctionFactory("owl.component.layout.vertical_box", "owlVerticalBox", Renderer, Controller);
exports.registerItem = component_1.registerFunctionFactory("owl.component.layout.vertical_box_item", "owlVerticalBoxItem", BoxItemRenderer, BoxItemController);


/***/ }),
/* 22 */
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
var component_1 = __webpack_require__(0);
var vh_base_1 = __webpack_require__(9);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype._setupContainerLayout = function (options) {
        options["layout"] = "row";
    };
    return Renderer;
}(vh_base_1.BaseBoxRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Controller;
}(vh_base_1.BaseBoxController));
exports.Controller = Controller;
var BoxItemRenderer = (function (_super) {
    __extends(BoxItemRenderer, _super);
    function BoxItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxItemRenderer.prototype._setupContainerClasses = function (root) {
    };
    return BoxItemRenderer;
}(vh_base_1.BaseBoxItemRenderer));
exports.BoxItemRenderer = BoxItemRenderer;
var BoxItemController = (function (_super) {
    __extends(BoxItemController, _super);
    function BoxItemController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BoxItemController;
}(vh_base_1.BaseBoxItemController));
exports.BoxItemController = BoxItemController;
exports.register = component_1.registerFunctionFactory("owl.component.layout.horizontal_box", "owlHorizontalBox", Renderer, Controller);
exports.registerItem = component_1.registerFunctionFactory("owl.component.layout.horizontal_box_item", "owlHorizontalBoxItem", BoxItemRenderer, BoxItemController);


/***/ }),
/* 23 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        this._setupClassNames(rootNode, options);
        this._copyContent(originalNode, rootNode);
        var entryNodes = new rendering_1.EntryNodeLookup();
        var result = new rendering_1.RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);
        return result;
    };
    Renderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        result["verticalAlign"] = this._getAttributeValue(node, "vertical-align", null);
        result["horizontalAlign"] = this._getAttributeValue(node, "horizontal-align", null);
        result["left"] = this._getAttributeValue(node, "left", null);
        result["right"] = this._getAttributeValue(node, "right", null);
        result["top"] = this._getAttributeValue(node, "top", null);
        result["bottom"] = this._getAttributeValue(node, "bottom", null);
        return result;
    };
    Renderer.TEMPLATE = "<div class='owl-floating-box'></div>";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._verticalAlign = options["verticalAlign"];
        this._horizontalAlign = options["horizontalAlign"];
        this._left = options["left"];
        this._right = options["right"];
        this._top = options["top"];
        this._bottom = options["bottom"];
    };
    Controller.prototype.repaint = function () {
        if (!this.parent)
            return;
        this._resolveVerticalPosition();
        this._resolveHorizontalPosition();
        _super.prototype.repaint.call(this);
    };
    Controller.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
    };
    Controller.prototype._resolveVerticalPosition = function () {
        if (this._verticalAlign != null) {
            var position = this._getMiddlePositionInContainer("height");
            this._view.rootElement.styles.set("top", position.toString() + "px");
        }
        else if (this._top != null) {
            this._view.rootElement.styles.set("top", this._top);
        }
        else if (this._bottom != null) {
            this._view.rootElement.styles.set("bottom", this._bottom);
        }
    };
    Controller.prototype._resolveHorizontalPosition = function () {
        if (this._horizontalAlign != null) {
            var position = this._getMiddlePositionInContainer("width");
            this._view.rootElement.styles.set("left", position.toString() + "px");
        }
        else if (this._left != null) {
            this._view.rootElement.styles.set("left", this._left);
        }
        else if (this._right != null) {
            this._view.rootElement.styles.set("right", this._right);
        }
    };
    Controller.prototype._getMiddlePositionInContainer = function (direction) {
        var containerSize = this.parent.view.size[direction];
        var contentSize = this.view.size[direction];
        return this._calculateMiddlePosition(containerSize, contentSize);
    };
    Controller.prototype._calculateMiddlePosition = function (containerSize, contentSize) {
        return (containerSize - contentSize) / 2;
    };
    return Controller;
}(base_1.DynamicSizeController));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.foating_box", "owlFloatingBox", Renderer, Controller);


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var List = __webpack_require__(25);
var ContentSwitch = __webpack_require__(26);
function register(cm, sm) {
    List.register(cm, sm);
    List.registerItem(cm, sm);
    ContentSwitch.register(cm, sm);
    ContentSwitch.registerItem(cm, sm);
}
exports.register = register;


/***/ }),
/* 25 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);
        var entryNodes = new rendering_1.EntryNodeLookup();
        var innerContainer = this._renderInnerContainer(options["type"], manipulator);
        this._copyContent(originalNode, innerContainer);
        entryNodes["itemContainer"] = innerContainer;
        rootNode.append(innerContainer);
        var result = new rendering_1.RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);
        return result;
    };
    Renderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        result["type"] = this._getAttributeValue(node, "type", "simple");
        return result;
    };
    Renderer.prototype._renderInnerContainer = function (listType, manipulator) {
        var template;
        switch (listType) {
            case "ordered":
                template = Renderer.TEMPLATE_ORDERED;
                break;
            case "unordered":
                template = Renderer.TEMPLATE_UNORDERED;
                break;
            default:
                template = Renderer.TEMPLATE_SIMPLE;
                break;
        }
        var inner = manipulator.createNewFragment(template);
        return inner;
    };
    Renderer.TEMPLATE = "<div class='owl-list'></div>";
    Renderer.TEMPLATE_ORDERED = "<ol></ol>";
    Renderer.TEMPLATE_UNORDERED = "<ul></ul>";
    Renderer.TEMPLATE_SIMPLE = "<ul class='owl-list-simple'></ul>";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
    };
    return Controller;
}(component_1.ControllerBase));
exports.Controller = Controller;
var ItemRenderer = (function (_super) {
    __extends(ItemRenderer, _super);
    function ItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemRenderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(ItemRenderer.TEMPLATE);
        this._setupClassNames(rootNode, options);
        this._copyContent(originalNode, rootNode);
        var entryNodes = new rendering_1.EntryNodeLookup();
        return new rendering_1.RenderResult(rootNode, entryNodes);
    };
    ItemRenderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        return result;
    };
    ItemRenderer.TEMPLATE = "<li class='owl-list-item'></li>";
    return ItemRenderer;
}(rendering_1.AbstractRenderer));
exports.ItemRenderer = ItemRenderer;
var ItemController = (function (_super) {
    __extends(ItemController, _super);
    function ItemController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
    };
    return ItemController;
}(base_1.VisualComponentController));
exports.ItemController = ItemController;
exports.register = component_1.registerFunctionFactory("owl.component.list", "owlList", Renderer, Controller);
exports.registerItem = component_1.registerFunctionFactory("owl.component.list_item", "owlListItem", ItemRenderer, ItemController);


/***/ }),
/* 26 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var base_1 = __webpack_require__(2);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);
        this._copyContent(originalNode, rootNode);
        var entryNodes = new rendering_1.EntryNodeLookup();
        return new rendering_1.RenderResult(rootNode, entryNodes);
    };
    Renderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        return result;
    };
    Renderer.TEMPLATE = "<div class='owl-content-switch'></div>";
    return Renderer;
}(rendering_1.AbstractRenderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._activeItem = null;
        _this._activeIndex = -1;
        return _this;
    }
    Controller.prototype.setActiveIndex = function (index) {
        var item = this._items[index];
        if (!item)
            throw new Error("Item index '" + index + "' was not found.");
        if (this._activeItem)
            this._activeItem.hide();
        item.show();
        item.repaint();
        this._activeItem = item;
    };
    Controller.prototype.setActiveName = function (name) {
        for (var i in this._items) {
            if (this._items[i].name == name) {
                this.setActiveIndex(Number(i));
                return;
            }
        }
        throw new Error("Item name '" + name + "' not found.");
    };
    Controller.prototype.setup = function (renderedContent, options) {
        this._items = new Array();
        _super.prototype.setup.call(this, renderedContent, options);
    };
    Controller.prototype._onTrackingReceived = function (evt) {
        var controller = evt.detail;
        if (controller instanceof ItemController) {
            this._items.push(controller);
            controller.hide();
            var newItemIndex = this._items.length - 1;
            if (this._activeIndex == -1)
                this._activeIndex = newItemIndex;
            if (this._activeIndex == newItemIndex)
                this.setActiveIndex(newItemIndex);
        }
    };
    return Controller;
}(base_1.SizeableController));
exports.Controller = Controller;
var ItemRenderer = (function (_super) {
    __extends(ItemRenderer, _super);
    function ItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemRenderer.prototype.render = function (originalNode, manipulator, options) {
        var rootNode = manipulator.createNewFragment(Renderer.TEMPLATE);
        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);
        this._copyContent(originalNode, rootNode);
        var entryNodes = new rendering_1.EntryNodeLookup();
        return new rendering_1.RenderResult(rootNode, entryNodes);
    };
    ItemRenderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        return result;
    };
    ItemRenderer.TEMPLATE = "<div class='owl-content-switch-item'></div>";
    return ItemRenderer;
}(rendering_1.AbstractRenderer));
exports.ItemRenderer = ItemRenderer;
var ItemController = (function (_super) {
    __extends(ItemController, _super);
    function ItemController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ItemController.prototype.setup = function (renderedContent, options) {
        _super.prototype.setup.call(this, renderedContent, options);
        this._name = options["name"] || null;
    };
    ItemController.prototype.repaint = function () {
        _super.prototype.repaint.call(this);
    };
    ItemController.prototype.hide = function () {
        this._view.rootElement.styles.addClass("owl-hidden");
    };
    ItemController.prototype.show = function () {
        this._view.rootElement.styles.removeClass("owl-hidden");
    };
    Object.defineProperty(ItemController.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    return ItemController;
}(base_1.SizeableController));
exports.ItemController = ItemController;
exports.register = component_1.registerFunctionFactory("owl.component.content_switch", "owlContentSwitch", Renderer, Controller);
exports.registerItem = component_1.registerFunctionFactory("owl.component.content_switch_item", "owlContentSwitchItem", ItemRenderer, ItemController);


/***/ }),
/* 27 */
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
var rendering_1 = __webpack_require__(1);
var component_1 = __webpack_require__(0);
var Label = __webpack_require__(10);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer.prototype.render = function (originalNode, manipulator, options) {
        var labelResult = _super.prototype._render.call(this, originalNode, manipulator, options);
        var outer, inner;
        _a = this._renderWrapper(manipulator), outer = _a[0], inner = _a[1];
        this._setupClassNames(outer, options);
        inner.append(labelResult.rootNode);
        if (options["width"])
            outer.styles.set("width", options["width"]);
        var entryNodes = labelResult.entryNodes;
        var result = new rendering_1.RenderResult(outer, entryNodes);
        return result;
        var _a;
    };
    Renderer.prototype.getOptions = function (node) {
        var result = _super.prototype.getOptions.call(this, node);
        result["label"] = node.node.textContent;
        result["width"] = this._getAttributeValue(node, "width", null);
        return result;
    };
    Renderer.prototype._renderWrapper = function (manipulator) {
        var wrapper = manipulator.createNewFragment(Renderer.TEXTBOX_CONTAINER);
        var inner = wrapper.chidlren.getFirst();
        return [wrapper, inner];
    };
    Renderer.TEXTBOX_CONTAINER = "<div class='owl-textbox'><div class='owl-textbox-inner'></div></div>";
    return Renderer;
}(Label.Renderer));
exports.Renderer = Renderer;
var Controller = (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Controller;
}(Label.Controller));
exports.Controller = Controller;
exports.register = component_1.registerFunctionFactory("owl.component.text_box", "owlTextBox", Renderer, Controller);


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = __webpack_require__(8);
function sizerFactory() {
    var manager = new base_1.SizerFactory();
    manager.addSizer("fitParent", function () { return new base_1.FitParent(); });
    manager.addSizer("fitWindow", function () { return new base_1.FitWindow(); });
    manager.addSizer("auto", function () { return new base_1.Auto(); });
    return manager;
}
exports.sizerFactory = sizerFactory;


/***/ }),
/* 29 */
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
var component_1 = __webpack_require__(0);
var rendering_1 = __webpack_require__(1);
var Application = (function (_super) {
    __extends(Application, _super);
    function Application() {
        return _super.call(this, "owlApplication") || this;
    }
    Application.prototype.setupApplication = function (rootElement) {
        var renderResult = new rendering_1.RenderResult(rootElement, new rendering_1.EntryNodeLookup());
        this.setup(renderResult, new Object());
    };
    return Application;
}(component_1.ControllerBase));
exports.Application = Application;


/***/ })
/******/ ]);