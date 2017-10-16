
import { DomManipulator } from "./dom";
import { ServiceManager } from "./service_management";
import { ModuleManager, ModuleFactoryFn } from "./modules"


export class OwlInWeb {

    static SERVICE_PREFIX_APPLICATION: string = "oow";

    static SERVICE_PREFIX_DOM_MANIPULATOR: string = "domManipulator";

    private _serviceManager: ServiceManager;

    private _domManipulator: DomManipulator;

    private _moduleManager: ModuleManager;

    constructor() {
        this._serviceManager = new ServiceManager();
        this._domManipulator = null;
    }

    public addMoudle(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._moduleManager.addModule(name, dependencies, factory);
    }

    public run(window: Window, rootElement: HTMLElement) : void {
        this._domManipulator = new DomManipulator(window, rootElement);
        this._initializeCommonServices();
        this._moduleManager.initializeModules(this._serviceManager);
    }

    public get serviceManager(): ServiceManager {
        return this._serviceManager;
    }

    public get domManipulator(): DomManipulator {
        return this._domManipulator;
    }

    private _initializeCommonServices() : void {
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_APPLICATION, () => { return this; });
        this._serviceManager.registerService(OwlInWeb.SERVICE_PREFIX_DOM_MANIPULATOR, () => { return this._domManipulator; });
    }
}