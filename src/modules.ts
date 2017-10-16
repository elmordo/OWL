import { ServiceManager, ServiceNamespace } from "./service_management"

export type ModuleFactoryFn = (rootServiceManager: ServiceManager, moduleServiceManager: ServiceManager, dependecies: ServiceManagerLookup) => void;


/**
 * manage and bootstrap (initialize) modules
 */
export class ModuleManager {

    /**
     * name of the namespace where modules are stored
     * @type {String}
     */
    public static MODULE_NS = "module";

    /**
     * registered modules
     * @type {Module[]}
     */
    private _modules: Module[];

    /**
     * initialize instance
     */
    constructor() {
        this._modules = new Array<Module>();
    }

    /**
     * add module to the manager
     * @param {string} name name of the module
     * @param {string[]} dependencies set of dependencies
     * @param {ModuleFactoryFn} factory factory function
     */
    public addModule(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._modules.push(new Module(name, dependencies, factory));
    }

    /**
     * initialize all registered modules
     * @param {ServiceManager} serviceManager the top level service manager
     */
    public initializeModules(serviceManager: ServiceManager) : void {
        let resolver: DependencyResolver = this._createResolver();
        let moduleLookup: Object = new Object();
        let moduleManagers: ServiceManagerLookup = new ServiceManagerLookup();
        let moduleServiceManager: ServiceManager = new ServiceManager(serviceManager.getNamespaceByPath(ModuleManager.MODULE_NS));

        for (let m of this._modules) moduleLookup[m.name] = m;

        while(resolver.getRemainingModulesCount() > 0) {
            let moduleName = resolver.getSatisfiedModuleName();
            let moduleInstance: Module = moduleLookup[moduleName];

            let sm: ServiceManager = this._initializeModule(moduleInstance,
                serviceManager, moduleServiceManager, moduleManagers);

            moduleManagers[moduleName] = sm;

            resolver.markAsResolved(moduleName);
        }
    }

    /**
     * create initialized dependency resolver
     * @return {DependencyResolver} initialized dependency resolver
     */
    private _createResolver() : DependencyResolver {
        let resolver: DependencyResolver = new DependencyResolver();

        for (let m of this._modules)
            resolver.addModule(m.name, m.dependencies);

        return resolver;
    }

    /**
     * initialize one module
     * @param {Module} moduleInstance instance of the module
     * @param {ServiceManager} rootServiceManager root service manager (top level)
     * @param {ServiceManager} moduleLevelServiceManager service manager with modules
     * @param {ServiceManagerLookup} moduleManagers lookup with all initialized modules service managers
     * @return {ServiceManager} service manager of the new instantized module
     */
    private _initializeModule(moduleInstance: Module,
            rootServiceManager: ServiceManager,
            moduleLevelServiceManager: ServiceManager,
            moduleManagers: ServiceManagerLookup) : ServiceManager {

        let moduleServiceManager: ServiceManager = new ServiceManager(
            moduleLevelServiceManager.getNamespaceByPath(moduleInstance.name));
        let customizedLookup = this._buildLookupForModuleFactory(
            moduleManagers, moduleInstance.dependencies);

        moduleInstance.factoryFn(rootServiceManager, moduleServiceManager, customizedLookup);

        return moduleServiceManager;
    }

    /**
     * build service lookup based on the dependencies
     * @param {ServiceManagerLookup} allManagers lookup with all available service managers
     * @param {string[]} dependencies set of dependencies
     * @return {ServiceManagerLookup} new lookup with managers defined by dependencies
     */
    private _buildLookupForModuleFactory(allManagers: ServiceManagerLookup, dependencies: string[]) : ServiceManagerLookup {
        let result: ServiceManagerLookup = new ServiceManagerLookup();

        for (let d of dependencies)
            result[d] = allManagers[d];

        return result;
    }
}


/**
 * lookup for the service manager
 * the key is module name
 * the value is module's service manager
 */
export class ServiceManagerLookup {

    [key: string]: ServiceManager;
}


/**
 * represent module and hold data need for the initialization
 */
class Module {

    /**
     * name of the module
     * @type {string}
     */
    private _name: string;

    /**
     * set of module dependencies
     * @type {string[]}
     */
    private _dependencies: string[];

    /**
     * factory function
     * @type {ModuleFactoryFn}
     */
    private _factoryFn: ModuleFactoryFn;

    /**
     * initialize instance
     * @param {string} name module name
     * @param {string[]} dependecies set of dependencies
     * @param {ModuleFactoryFn} factory factory function
     */
    constructor(name: string, dependecies: string[], factory: ModuleFactoryFn) {
        this._name = name;
        this._dependencies = dependecies;
        this._factoryFn = factory;
    }

    /**
     * name of the module
     * @return {string} name of the module
     */
    get name(): string {
        return this._name;
    }

    /**
     * set of dependencies
     * @return {string[]} set of dependencies
     */
    get dependencies(): string[] {
        return this._dependencies;
    }

    /**
     * factory function initializing the module
     * @return {ModuleFactoryFn} factory function
     */
    get factoryFn(): ModuleFactoryFn {
        return this._factoryFn;
    }
}


/**
 * resolve dependencies for the module initialization
 */
class DependencyResolver {

    /**
     * set of the dependencies wating for resolve
     * @type {DependencyResolvingRecord[]}
     */
    private _remainingDependencies: DependencyResolvingRecord[];

    /**
     * initialize instance
     */
    constructor() {
        this._remainingDependencies = new Array<DependencyResolvingRecord>();
    }

    /**
     * register module and its dependencies
     * @param {string} moduleName name of the module
     * @param {string[]} dependencies set of dependencies
     */
    public addModule(moduleName: string, dependencies: string[]) : void {
        let record: DependencyResolvingRecord = this._getRecord(moduleName);

        if (record)
            record.addDependencies(dependencies);
    }

    /**
     * mark module as resolved
     * @param {string} moduleName [description]
     */
    public markAsResolved(moduleName: string) : void {
        let record: DependencyResolvingRecord = this._tryToGetRecord(moduleName);
        let index: number = this._remainingDependencies.indexOf(record);
        this._remainingDependencies.splice(index, 1);

        for (let r of this._remainingDependencies) {
            r.satisfyDepndency(moduleName);
        }
    }

    /**
     * get number of modules left to satisfy
     * @return {number} number of remaining modules
     */
    public getRemainingModulesCount() : number {
        return this._remainingDependencies.length;
    }

    /**
     * look for module with all dependencies satisfied
     * @return {string} name of the module with all deps satisfied
     * @throws {Error} no module found
     */
    public getSatisfiedModuleName(): string {
        let result: string = null;

        for (let r of this._remainingDependencies) {
            if (r.isSatisfied) {
                result = r.name;
                break;
            }
        }

        if (!result)
            throw new Error("Dependencies are not satisfied");

        return result;
    }

    /**
     * get record of the given name
     * @param {string} moduleName module name
     * @throws {Error} module is not registered
     */
    private _tryToGetRecord(moduleName) : DependencyResolvingRecord {
        let record: DependencyResolvingRecord = this._getRecord(moduleName);

        if (record == null)
            throw new Error("Module '" + moduleName + "' is not registered");

        return record;
    }

    /**
     * get record with requested name or NULL if record is not registered
     * @param {string} moduleName module name
     * @return {DependencyResolvingRecord|NULL} result of the search
     */
    private _getRecord(moduleName: string) : DependencyResolvingRecord {
        let record: DependencyResolvingRecord = null;

        for (let x of this._remainingDependencies) {
            if (x.name == moduleName) {
                record = x;
                break;
            }
        }

        return record;
    }
}


/**
 * data holder class for the dependecy information
 */
class DependencyResolvingRecord {

    /**
     * name of the module
     * @type {string}
     */
    public name: string;

    /**
     * set of module names what module depends on
     * @type {string[]}
     */
    public dependencies: string[];

    /**
     * initialize instance
     * @param {string} name module name
     * @param {string[]} dependencies set of module dependencies
     */
    constructor(name: string, dependencies: string[]) {
        this.name = name;
        this.dependencies = new Array<string>();
        this.addDependencies(dependencies);
    }

    /**
     * mark dependecy as satisfied
     * @param {string} dependency dependency to satisfy
     */
    public satisfyDepndency(dependency: string): void {
        let index: number = this.dependencies.indexOf(dependency);

        if (index != -1) {
            this.dependencies.splice(index, 1);
        }
    }

    /**
     * add dependencies to the list
     * @param {string[]} dependencies set of dependencies to add
     */
    public addDependencies(dependencies: string[]) : void {
        this.dependencies.push.apply(this.dependencies, dependencies);
    }

    /**
     * return true if all dependencies are satisfied
     * @return {boolean} true if dependencies are satisfied
     */
    get isSatisfied(): boolean {
        return this.dependencies.length == 0;
    }
}
