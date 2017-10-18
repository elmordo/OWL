
import { ServiceManager } from "./service_management";
import { IRenderer, RenderResult } from "./rendering";
import { DomManipulator, CommonHtmlNode, CommonHtmlElement } from "./dom";

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

        return this._createController(componentDsc, options, renderedContent);
    }

    private _getRenderer(description: ComponentDescription) : IRenderer {
        let rendererName: string = description.rendererName;
        return <IRenderer>this._serviceManager.getServiceByPath(rendererName);
    }

    private _createController(description: ComponentDescription, options: Object, rendered: RenderResult) : ControllerBase {
        let controllerName: string = description.controllerName;

        let controller: ControllerBase = <ControllerBase>this._serviceManager.getServiceByPath(controllerName);
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


/**
 * replace component placeholders in dom by real rendered components
 */
export class ComponentInserter {

    private _componentFactory: ComponentFactory;

    private _rootElement: HTMLElement;

    constructor(componentFactory: ComponentFactory, rootElement: HTMLElement) {
        this._componentFactory = componentFactory;
        this._rootElement = rootElement;
    }

    public insertComponents() : void {
        let walker: TreeWalker = this._createWalker();
        let currentNode:Node = walker.nextNode();

        while(currentNode) {
            let nodeToProcess: Node = currentNode;
            currentNode = walker.nextNode();

            this._processElement(<HTMLElement>nodeToProcess);
        }
    }

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

    private _processElement(element: HTMLElement) : void {
        // get name
        let name = this._getComponentName(element);
        let componentController = this._componentFactory.createComponentInstance(name, element);

        element.parentElement.replaceChild(componentController.view.node, element);
    }

    private _getComponentName(element: HTMLElement) : string {
        let nameParts = element.tagName.substr(4).toLowerCase().split("-");
        let result = nameParts[0];

        for (var i = 1; i < nameParts.length; ++i) {
            result += nameParts[i].charAt(0).toUpperCase() + nameParts[i].substr(1);
        }

        return result;
    }
}


export class ControllerBase {

    static OPT_ID = "id";

    protected _view: RenderResult;

    private _id: string;

    constructor() {
    }

    /**
     * setup the instance
     * @param {Object} options options to setup
     */
    public setup(renderedContent: RenderResult, options: Object) : void {
        this._view = renderedContent;
        this._id = options[ControllerBase.OPT_ID] || null;
    }

    get id(): string {
        return this._id;
    }

    get view(): CommonHtmlNode {
        return this._view.rootNode;
    }
}


/**
 * the key is component name
 * the value is component description instance
 */
class ComponentLookup {
    [name: string]: ComponentDescription;
}
