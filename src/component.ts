
import { ServiceManager } from "./service_management";
import { IRenderer, RenderResult } from "./rendering";
import { DomManipulator, CommonHtmlNode, CommonHtmlElement } from "./dom";
import { ISizer, ASizer, SizerFactory } from "./view/sizer/base"
import { EventDispatcher, DomEvent, OwlEvent } from "./events"
import { PropertyWatchdog, WatchdogEventFactory } from "./dom_utils"

/**
 * describe component and hold information required to create
 * component instance
 */
export class ComponentDescription {

    /**
     * component name
     * @type {string}
     */
    private _name: string;

    /**
     * renderer name
     * @type {string}
     */
    private _rendererName: string;

    /**
     * controller name
     * @type {string}
     */
    private _controllerName: string;

    /**
     * create component description
     * @param {string} name name of the component
     * @param {string} rendererName renderer name
     * @param {string} controllerName controller name
     */
    constructor(name: string, rendererName: string, controllerName: string) {
        this._name = name;
        this._rendererName = rendererName;
        this._controllerName = controllerName;
    }

    /**
     * get name of the component
     * @return {string} name of the component
     */
    get name(): string {
        return this._name;
    }

    /**
     * get renderer name
     * @return {string} renderer name
     */
    get rendererName(): string {
        return this._rendererName;
    }

    /**
     * set new renderer name
     * @param {string} val new renderer name
     */
    set rendererName(val: string ) {
        this._rendererName = val;
    }

    /**
     * get controller name
     * @return {string} controller name
     */
    get controllerName(): string {
        return this._controllerName;
    }

    /**
     * set new controller name
     * @param {string} val new controller name
     */
    set controllerName(val: string) {
        this._controllerName = val;
    }
}


/**
 * manage component descriptions and create new component instances
 */
export class ComponentFactory {

    /**
     * set of registered components
     * @type {ComponentLookup}
     */
    private _components: ComponentLookup;

    /**
     * service manager where services are stored
     * @type {ServiceManager}
     */
    private _serviceManager: ServiceManager;

    /**
     * the instance of dom manipulator
     * @type {DomManipulator}
     */
    private _domManipulator: DomManipulator;

    /**
     * initialize instance
     * @param {ServiceManager} serviceManager service manager where service as stored
     * @param {DomManipulator} domManipulator dom manipulator to use for rendering
     */
    constructor(serviceManager: ServiceManager, domManipulator: DomManipulator) {
        this._components = new ComponentLookup();
        this._serviceManager = serviceManager;
        this._domManipulator = domManipulator;
    }

    /**
     * register component to manager
     * @param {ComponentDescription} component component to register
     * @throws Error component with same name is registered
     */
    public registerComponent(component: ComponentDescription): void {
        this._assertNotExists(component.name);
        this._components[component.name] = component;
    }

    public createComponentInstance(name: string, element: HTMLElement) : ControllerBase {
        this._assertExists(name);

        let componentDsc: ComponentDescription = this._components[name];
        let renderer = this._getRenderer(componentDsc);
        let mappedElement = new CommonHtmlElement(element, this._domManipulator);
        let options = renderer.getOptions(mappedElement);
        let renderedContent: RenderResult = renderer.render(mappedElement, this._domManipulator, options);

        let controller: ControllerBase = this._createController(componentDsc, options, renderedContent);
        controller.renderer = renderer;

        return controller;
    }

    private _getRenderer(description: ComponentDescription) : IRenderer {
        let rendererName: string = description.rendererName;
        return <IRenderer>this._serviceManager.getServiceByPath(rendererName);
    }

    private _createController(description: ComponentDescription, options: Object, rendered: RenderResult) : ControllerBase {
        let controllerName: string = description.controllerName;

        let controller: ControllerBase = <ControllerBase>this._serviceManager.getServiceByPath(controllerName);
        controller.serviceManager = this._serviceManager;
        controller.setup(rendered, options);
        return controller;
    }

    /**
     * if component does not exist, throw error
     * @param {string} name name of the component to test
     * @throws Error component is not registered
     */
    private _assertExists(name: string) : void {
        if (!this._components[name])
            throw new Error("Component '" + name + "' does not exist");
    }

    /**
     * if component exist, throw error
     * @param {string} name name of the component to test
     * @throws Error component is registered
     */
    private _assertNotExists(name: string) : void {
        if (this._components[name])
            throw new Error("Component '" + name + "' is already registered");
    }
}


export class ControllerManager {

    private _lookup: ControllerLookup;

    constructor() {
        this._lookup = new ControllerLookup();
    }

    public registerComponent(controller: ControllerBase) : void {
        let id: string = controller.id;

        if (!id)
            throw new Error("Id has to be set");

        if (this._lookup[id])
            throw new Error("Controller '" + id + "' is already registered");

        this._lookup[id] = controller;
    }

    public get(name: string) : ControllerBase {
        if (!this._lookup[name])
            throw new Error("Controller '" + name + "' is not registered");

        return this._lookup[name];
    }
}


/**
 * replace component placeholders in dom by real rendered components
 */
export class ComponentInserter {

    /**
     * component factory
     * @type {ComponentFactory}
     */
    private _componentFactory: ComponentFactory;

    /**
     * manage controllers
     * @type {ControllerManager}
     */
    private _controllerManager: ControllerManager;

    /**
     * root element of the app
     * @type {HTMLElement}
     */
    private _rootElement: HTMLElement;

    /**
     * root controller of the application
     * @type {ControllerBase}
     */
    private _rootController: ControllerBase;

    /**
     * create new instance of the component inserter and initialize it
     * @param {ComponentFactory} componentFactory component factory
     * @param {HTMLElement} rootElement root element of the app
     */
    constructor(componentFactory: ComponentFactory, controllerManager: ControllerManager, rootController: ControllerBase) {
        this._controllerManager = controllerManager;
        this._componentFactory = componentFactory;
        this._rootController = rootController;
        this._rootElement = <HTMLElement>rootController.view.node;
    }

    /**
     * process template and insert components
     */
    public insertComponents() : void {
        let walker: TreeWalker = this._createWalker();
        let currentNode:Node = walker.nextNode();

        while(currentNode) {
            let nodeToProcess: Node = currentNode;

            try {
                walker.currentNode = this._processElement(<HTMLElement>nodeToProcess);
            } catch (err) {
                console.error(err);
            }

            currentNode = walker.nextNode();
        }
    }

    /**
     * create new DOM walker
     * @return {TreeWalker} dom walker
     */
    private _createWalker() : TreeWalker {
        let document = this._rootElement.ownerDocument;
        let filter = {
            acceptNode: (node: Node): number => {
                let element: HTMLElement = <HTMLElement>node;

                return (element.tagName.substr(0, 4) == "OWL:") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        };
        return document.createTreeWalker(this._rootElement, NodeFilter.SHOW_ELEMENT, filter);
    }

    /**
     * process one component
     * @param {HTMLElement} element the element to process
     * @return {Node} component visual representation
     */
    private _processElement(element: HTMLElement) : Node {
        // get name
        let name = this._getComponentName(element);
        let componentController = this._componentFactory.createComponentInstance(name, element);

        element.parentElement.replaceChild(componentController.view.node, element);
        componentController.repaint();

        if (componentController.id)
            this._controllerManager.registerComponent(componentController);

        bindStaticEvents(componentController, element);
        componentController.initialize();

        // TODO: delete these two rows
        if (!componentController.parent)
            console.log(componentController);

        return componentController.view.node;
    }

    /**
     * get component name from the element
     * @param {HTMLElement} element element to detect name from
     * @return {string} name of the component
     */
    private _getComponentName(element: HTMLElement) : string {
        let nameParts = element.tagName.substr(4).toLowerCase().split("-");
        let result = nameParts[0];

        for (var i = 1; i < nameParts.length; ++i) {
            result += nameParts[i].charAt(0).toUpperCase() + nameParts[i].substr(1);
        }

        return result;
    }
}


export class ControllerBase extends EventDispatcher {

    static EVENT_CLICK = "click";
    static EVENT_RESIZE = "resize";
    static EVENT_REPAING = "repaint";
    static EVENT_TRACKING_SIGNAL = "tracking_signal";
    static EVENT_TRACKED = "tracked";

    /**
     * name of attribute with public id of the controller
     * @type {String}
     */
    static OPT_ID = "id";

    /**
     * next interanl id of the controller
     * @type {Number}
     */
    static _NEXT_ID = 1;

    /**
     * internal identifier of the component
     * @type {number}
     */
    private _internalId: number;

    /**
     * parent component in hierarchy
     * @type {ControllerBase}
     */
    private _parent: ControllerBase;

    /**
     * set of child components
     * @type {ControllerBase[]}
     */
    private _children: ControllerBase[];

    /**
     * view representation of the component
     * @type {RenderResult}
     */
    protected _view: RenderResult;

    /**
     * the view renderer
     * @type {IRenderer}
     */
    protected _renderer: IRenderer;

    /**
     * instance of service manager to use
     * @type {ServiceManager}
     */
    protected _serviceManager: ServiceManager;

    /**
     * gateway between real dom and component
     * @type {DomEventGateway}
     */
    protected _domEventGateway: DomEventGateway;

    /**
     * controller manager for static event handlers
     * @type {ControllerManager}
     */
    protected _controllerManager: ControllerManager;

    /**
     * public identifier of the component
     * @type {string}
     */
    private _id: string;

    /**
     * type of controller
     * @type {string}
     */
    private _type: string;

    /**
     * watch for size change
     * @type {PropertyWatchdog}
     */
    private _sizeWatchdog: PropertyWatchdog;

    constructor(type: string) {
        super()

        this._type = type;

        this._internalId = ControllerBase._NEXT_ID++;
        this._view = null;
        this._serviceManager = null;
        this._domEventGateway = null;
        this._parent = null;
        this._children = new Array<ControllerBase>();
    }

    /**
     * setup the instance
     * @param {Object} options options to setup
     */
    public setup(renderedContent: RenderResult, options: Object) : void {
        this._view = renderedContent;
        this._id = options[ControllerBase.OPT_ID] || null;

        this._setupGateway();
        this._setupTracking();

        this._controllerManager = <ControllerManager>this._serviceManager.getServiceByPath("owl.controllerManager");
        this._sizeWatchdog = new PropertyWatchdog(
            this,
            this._createWatchdogEventFactory(ControllerBase.EVENT_RESIZE),
            this._view.rootNode.node,
            ["offsetWidth", "offsetHeight"]);
    }

    /**
     * initialize component in component tree
     */
    public initialize() : void {
        this._dispatchTrackingSignal();
        this.repaint();
    }

    /**
     * cause element repaint
     */
    public repaint() : void {
        this._dispatchLocalEvent(ControllerBase.EVENT_REPAING);
        this._sizeWatchdog.watch();
    }

    public getSupportedEvents(): string[] {
        return [];
    }

    /**
     * dispatch local OWL event (event has not origin in real DOM)
     * @param {string} eventType event type
     * @param {Object=null} data optional data
     */
    protected _dispatchLocalEvent(eventType: string, data: Object=null) : void {
        let evt: OwlEvent = new OwlEvent(eventType, data);
        this.dispatchEvent(evt);
    }

    protected _onTrackingReceived(evt: CustomEvent) : void {
    }

    protected _onTracked(evt: CustomEvent) : void {
    }

    protected _createWatchdogEventFactory(evtType: string): WatchdogEventFactory {
        return (dispatcher, diff) => { return new OwlEvent(evtType); };
    }

    private _dispatchTrackingSignal() : void {
        let evt = new CustomEvent(ControllerBase.EVENT_TRACKING_SIGNAL, { detail: this, "bubbles": true });
        this._view.rootNode.node.dispatchEvent(evt);
    }

    /**
     * setup DOM event - Local event gateway
     */
    private _setupGateway() : void {
        this._domEventGateway = new DomEventGateway(this);
        this._domEventGateway.listenForEnumeratedEvents(this.getSupportedEvents());
    }

    /**
     * setup tracking signal handling
     */
    private _setupTracking() : void {
        let self: ControllerBase = this;

        this._view.rootNode.node.addEventListener(ControllerBase.EVENT_TRACKING_SIGNAL, (evt: Event) => {
            let realEvt: CustomEvent = <CustomEvent>evt;
            let sender = <ControllerBase>realEvt.detail;

            if (sender._internalId != self._internalId) {
                evt.stopPropagation();

                if (sender._parent && sender._parent != self) {
                    // remove child from the parent
                    sender._parent._removeChild(sender);
                }

                sender._parent = self;

                if (self._children.indexOf(sender) == -1)
                    self._children.push(sender);

                self._onTrackingReceived(realEvt);

                let trackedEvt = new CustomEvent(ControllerBase.EVENT_TRACKED, { "detail": self });
                sender._onTracked(trackedEvt);
            }

            return true;
        });

    }

    /**
     * remove child from the component
     * @param {ControllerBase} child [description]
     */
    private _removeChild(child: ControllerBase) : void {
        if (child._parent == this) {
            let index = this._children.indexOf(child);
            if (index != -1)
                this._children.splice(index, 1);

            child._parent = null;
        }
    }

    /**
     * get id of the component
     * @return {string} id of the component
     */
    get id(): string {
        return this._id;
    }

    /**
     * get view representation of the component
     * @return {CommonHtmlNode} view representation of the component
     */
    get view(): CommonHtmlNode {
        return this._view.rootNode;
    }

    /**
     * return type of the controller
     * @return {string} type of the controller
     */
    get type(): string {
        return this._type;
    }

    /**
     * service manager getter
     * @return {ServiceManager} injected service manager
     */
    get serviceManager(): ServiceManager {
        return this._serviceManager;
    }

    /**
     * service manager setter
     * @param {ServiceManager} val new service manager
     */
    set serviceManager(val: ServiceManager) {
        this._serviceManager = val;
    }

    get renderer(): IRenderer {
        return this._renderer;
    }

    set renderer(val: IRenderer) {
        this._renderer = val;
    }

    get controllerManager(): ControllerManager {
        return this._controllerManager;
    }

    get parent(): ControllerBase {
        return this._parent;
    }

    get children(): ControllerBase[] {
        return this._children.slice(0, this._children.length);
    }
}


export class DomEventGateway {

    private _controller: ControllerBase;

    private _rootNode: CommonHtmlNode;

    private _managedEventTypes: string[];

    constructor(controller: ControllerBase) {
        this._controller = controller;
        this._rootNode = controller.view;
        this._managedEventTypes = new Array<string>();
    }

    public listenForEnumeratedEvents(eventTypes: string[]) : void {
        eventTypes.forEach((type) => {
            this.listenForEvent(type);
        });
    }

    public listenForEvent(eventType) : void {
        this._rootNode.addEventListener(eventType, (evt) => { this._handleEvent(evt); });
    }

    private _handleEvent(event: Event) : void {
        let wrappedEvent = new DomEvent(event);
        this._controller.dispatchEvent(wrappedEvent);
    }
}


export function registerFunctionFactory(baseNs: string, name: string, renderer, controller): Function {
    return (cm: ComponentFactory, sm: ServiceManager) => {
        let rendererName: string = baseNs + ".renderer";
        let controllerName: string = baseNs + ".controller";

        sm.registerService(rendererName, () => { return new renderer(); }, false);
        sm.registerService(controllerName, () => { return new controller(name); }, false);

        let dsc: ComponentDescription = new ComponentDescription(name, rendererName, controllerName);
        cm.registerComponent(dsc);
    }
}


export function bindStaticEvents(controller: ControllerBase, originalNode: HTMLElement): void {
    for (let i = 0; i < originalNode.attributes.length; ++i) {
        let attr: Attr = originalNode.attributes.item(i);

        if (isStaticEvent(attr)) {
            let eventType = getStaticEventType(attr);
            let expr = attr.value;
            let handler = createStaticEventHandler(expr, controller);
            controller.addEventListener(eventType, handler);
        }
    }
}

function isStaticEvent(attr: Attr): boolean {
    return attr.name.substr(0, 5) == "hoot:";
}

function getStaticEventType(attr: Attr): string {
    return attr.name.substr(5);
}

function createStaticEventHandler(expr: string, context: ControllerBase): Function {
    let result = new Function("$event", expr);
    return result.bind(context);
}


/**
 * the key is component name
 * the value is component description instance
 */
class ComponentLookup {
    [name: string]: ComponentDescription;
}


class ControllerLookup {
    [key: string]: ControllerBase;
}
