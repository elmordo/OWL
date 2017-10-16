
import { DomManipulator } from "./dom";
import { ServiceManager } from "./service_management";
import { ModuleManager, ModuleFactoryFn } from "./modules"


export class OwlInWeb {

    private _serviceManager: ServiceManager;

    private _domManipulator: DomManipulator;

    constructor() {
        this._serviceManager = new ServiceManager();
        this._domManipulator = null;
    }

    public addMoudle(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        // code...
    }

    public run(window: Window, rootElement: HTMLElement) : void {
        this._domManipulator = new DomManipulator(window, rootElement);
    }

    public get serviceManager(): ServiceManager {
        return this._serviceManager;
    }

    public get domManipulator(): DomManipulator {
        return this._domManipulator;
    }

}