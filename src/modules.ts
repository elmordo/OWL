import { ServiceManager } from "./service_management"

export type ModuleFactoryFn = (rootServiceManager: ServiceManager, moduleServiceManager: ServiceManager, dependecies: ServiceManagerLookup) => void;


export class ModuleManager {

    private _modules: Module[];

    construct() {
        this._modules = new Array<Module>();
    }

    public addModule(name: string, dependencies: string[], factory: ModuleFactoryFn) : void {
        this._modules.push(new Module(name, dependencies, factory));
    }

    public initializeModules(serviceManager: ServiceManager) : void {
        // code...
    }
}


export class ServiceManagerLookup {

    [key: string]: ServiceManager;
}


class Module {

    private _name: string;

    private _dependencies: string[];

    private _factoryFn: ModuleFactoryFn;

    constructor(name: string, dependecies: string[], factory: ModuleFactoryFn) {
        this._name = name;
        this._dependencies = dependecies;
        this._factoryFn = factory;
    }

    get name(): string {
        return this._name;
    }

    get dependencies(): string[] {
        return this._dependencies;
    }

    get factoryFn(): ModuleFactoryFn {
        return this._factoryFn;
    }
}


class DependencyResolver {

    /**
     * set of the dependencies wating for resolve
     * @type {DependencyResolvingRecord[]}
     */
    private _remainingDependencies: DependencyResolvingRecord[];

    /**
     * initialize instance
     */
    construct() {
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
    construct(name: string, dependencies: string[]) {
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
