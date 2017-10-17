
import { DomManipulator } from "./dom";
import { ServiceManager } from "./service_management";
import { ModuleManager, ModuleFactoryFn } from "./modules"
import { register } from "./components/register"
import { ComponentManager} from "./component"


export class OwlInWeb {

    static SERVICE_PREFIX_APPLICATION: string = "owl.application";

    static SERVICE_PREFIX_DOM_MANIPULATOR: string = "owl.domManipulator";

    static SERVICE_PREFIX_COMPONENT_MANAGER: string = "owl.componentManager";

    private _serviceManager: ServiceManager;

    private _domManipulator: DomManipulator;

    private _moduleManager: ModuleManager;

    private _componentManager: ComponentManager;

    private _rootElement: HTMLElement;

    private _window: Window;

    constructor() {
        this._serviceManager = new ServiceManager();
        this._moduleManager = new ModuleManager();
        this._domManipulator = null;
        this._componentManager = null;
    }

    public addMoudle(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._moduleManager.addModule(name, dependencies, factory);
    }

    public run(window: Window, rootElement: HTMLElement) : void {
        this._rootElement = rootElement;
        this._window = window;

        this._initialize();
        this._moduleManager.initializeModules(this._serviceManager);
    }

    public get serviceManager(): ServiceManager {
        return this._serviceManager;
    }

    public get domManipulator(): DomManipulator {
        return this._domManipulator;
    }

    public get componentManager(): ComponentManager {
        return this._componentManager;
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
    }

    private _initializeMembers() : void {
        this._domManipulator = new DomManipulator(this._window, this._rootElement);
        this._componentManager = new ComponentManager(this._serviceManager, this._domManipulator);
    }

    private _initializeCommonServices() : void {
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_APPLICATION, () => { return this; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_DOM_MANIPULATOR, () => { return this._domManipulator; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_COMPONENT_MANAGER, () => { return this._componentManager; });
    }

    private _initializeComponents() : void {
        register(this._componentManager, this._serviceManager);
    }
}
