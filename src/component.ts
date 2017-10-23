
import { ServiceManager } from "./service_management";
import { IRenderer, RenderResult } from "./rendering";
import { DomManipulator, CommonHtmlNode, CommonHtmlElement } from "./dom";
import { ISizer, SizerFactory } from "./view/sizer/base"
import { EventDispatcher, DomEvent, OwlEvent } from "./events"

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
     * create new instance of the component inserter and initialize it
     * @param {ComponentFactory} componentFactory component factory
     * @param {HTMLElement} rootElement root element of the app
     */
    constructor(componentFactory: ComponentFactory, controllerManager: ControllerManager, rootElement: HTMLElement) {
        this._controllerManager = controllerManager;
        this._componentFactory = componentFactory;
        this._rootElement = rootElement;
    }

    /**
     * process template and insert components
     */
    public insertComponents() : void {
        let walker: TreeWalker = this._createWalker();
        let currentNode:Node = walker.nextNode();

        while(currentNode) {
            let nodeToProcess: Node = currentNode;
            walker.currentNode = this._processElement(<HTMLElement>nodeToProcess);
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

    constructor() {
        super()

        this._internalId = ControllerBase._NEXT_ID++;
        this._view = null;
        this._serviceManager = null;
        this._domEventGateway = null;
    }

    /**
     * setup the instance
     * @param {Object} options options to setup
     */
    public setup(renderedContent: RenderResult, options: Object) : void {
        this._view = renderedContent;
        this._id = options[ControllerBase.OPT_ID] || null;

        if (!this._domEventGateway) {
            this._domEventGateway = new DomEventGateway(this);
            this._domEventGateway.listenForEnumeratedEvents(this.supportedEvents);
        }

        this._controllerManager = <ControllerManager>this._serviceManager.getServiceByPath("owl.controllerManager");
    }

    /**
     * cause element repaint
     */
    public repaint() : void {
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

    get supportedEvents(): string[] {
        return ["click"];
    }

    get controllerManager(): ControllerManager {
        return this._controllerManager;
    }
}


export class SizeableComponent extends ControllerBase {

    private _sizer: ISizer;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._setupSizer(options);
    }

    public repaint() : void {
        this._sizer.updateSize();
    }

    public _setupSizer(options: Object) : void {
        let sizerType: string = options["sizer"];
        let sizerFactory: SizerFactory = <SizerFactory>this.serviceManager.getServiceByPath("owl.sizerFactory");
        let sizer = sizerFactory.getSizer(sizerType);

        sizer.setup(this._view.rootNode, options);
        this._sizer = sizer;
        this._sizer.updateSize();
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
        sm.registerService(controllerName, () => { return new controller(); }, false);

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
            console.log(controller);
            controller.addEventListener(eventType, createStaticEventHandler(expr, controller));
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
