
import { DomManipulator } from "./dom";
import { ServiceManager } from "./service_management";
import { ModuleManager, ModuleFactoryFn } from "./modules"
import { register } from "./view/components/register"
import { ComponentFactory, ComponentInserter } from "./component"


export class OwlInWeb {

    static SERVICE_PREFIX_APPLICATION: string = "owl.application";

    static SERVICE_PREFIX_DOM_MANIPULATOR: string = "owl.domManipulator";

    static SERVICE_PREFIX_COMPONENT_MANAGER: string = "owl.componentManager";

    private _serviceManager: ServiceManager;

    private _domManipulator: DomManipulator;

    private _moduleManager: ModuleManager;

    private _componentFactory: ComponentFactory;

    private _rootElement: HTMLElement;

    private _window: Window;

    private _componentInserter: ComponentInserter;

    constructor() {
        this._serviceManager = new ServiceManager();
        this._moduleManager = new ModuleManager();
        this._domManipulator = null;
        this._componentFactory = null;
    }

    public addMoudle(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._moduleManager.addModule(name, dependencies, factory);
    }

    public run(window: Window, rootElement: HTMLElement) : void {
        this._rootElement = rootElement;
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
        this._componentInserter = new ComponentInserter(this._componentFactory, this._rootElement);
    }

    private _initializeCommonServices() : void {
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_APPLICATION, () => { return this; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_DOM_MANIPULATOR, () => { return this._domManipulator; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_COMPONENT_MANAGER, () => { return this._componentFactory; });
    }

    private _initializeComponents() : void {
        register(this._componentFactory, this._serviceManager);
    }
}
