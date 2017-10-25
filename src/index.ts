
import { DomManipulator, CommonHtmlElement } from "./dom";
import { ServiceManager } from "./service_management";
import { ModuleManager, ModuleFactoryFn } from "./modules"
import { register } from "./view/components/register"
import { ComponentFactory, ComponentInserter, ControllerManager } from "./component"
import { sizerFactory } from "./view/sizer/factory"
import { SizerFactory } from "./view/sizer/base"
import { Application } from "./application"


export class OwlWebLib {

    static SERVICE_PREFIX_APPLICATION: string = "owl.application";

    static SERVICE_PREFIX_DOM_MANIPULATOR: string = "owl.domManipulator";

    static SERVICE_PREFIX_COMPONENT_MANAGER: string = "owl.componentManager";

    static SERVICE_PREFIX_SIZER_MANAGER: string = "owl.sizerFactory";

    static SERVICE_PREFIX_CONTROLLER_MANAGER: string = "owl.controllerManager";

    private _serviceManager: ServiceManager;

    private _domManipulator: DomManipulator;

    private _moduleManager: ModuleManager;

    private _componentFactory: ComponentFactory;

    private _controllerManager: ControllerManager;

    private _rootElement: HTMLElement;

    private _application: Application;

    private _window: Window;

    private _componentInserter: ComponentInserter;

    private _sizerFactory: SizerFactory;

    constructor() {
        this._serviceManager = new ServiceManager();
        this._moduleManager = new ModuleManager();
        this._controllerManager = new ControllerManager();
        this._sizerFactory = sizerFactory();
        this._domManipulator = null;
        this._componentFactory = null;
    }

    public addMoudle(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._moduleManager.addModule(name, dependencies, factory);
    }

    public run(window: Window, rootElement: HTMLElement) : void {
        this._rootElement = rootElement;
        this._application = new Application();
        this._window = window;

        this._initialize();
        this._componentInserter.insertComponents();
    }

    public get serviceManager(): ServiceManager {
        return this._serviceManager;
    }

    public get domManipulator(): DomManipulator {
        return this._domManipulator;
    }

    public get componentManager(): ComponentFactory {
        return this._componentFactory;
    }

    public get rootElement(): HTMLElement {
        return this._rootElement;
    }

    public get window(): Window {
        return this._window;
    }

    private _initialize() : void {
        this._initializeMembers();
        this._initializeCommonServices();
        this._initializeComponents();
        this._moduleManager.initializeModules(this._serviceManager);
    }

    private _initializeMembers() : void {
        this._domManipulator = new DomManipulator(this._window, this._rootElement);
        this._componentFactory = new ComponentFactory(this._serviceManager, this._domManipulator);
        this._application.setupApplication(<CommonHtmlElement>this._domManipulator.mapNode(this._rootElement));
        this._componentInserter = new ComponentInserter(this._componentFactory, this._controllerManager, this._application);
    }

    private _initializeCommonServices() : void {
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_APPLICATION, () => { return this; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_DOM_MANIPULATOR, () => { return this._domManipulator; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_COMPONENT_MANAGER, () => { return this._componentFactory; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_SIZER_MANAGER, () => { return this._sizerFactory; });
        this._serviceManager.registerService(OwlWebLib.SERVICE_PREFIX_CONTROLLER_MANAGER, () => { return this._controllerManager; });
    }

    private _initializeComponents() : void {
        register(this._componentFactory, this._serviceManager);
    }
}
