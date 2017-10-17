/**
 * error thrown when item missing in ServiceIndex or Namespace index
 */
export class LookupError extends Error {
}

export class ServiceBase {
}

/**
 * provides service instance
 */
class ServiceContainer {

    /**
     * factory function
     * @type {Function} factory function
     */
    private _factory: Function;

    /**
     * is service shared?
     * @type {boolean}
     */
    private _shared: boolean;

    /**
     * cached instance of the shared service
     * @type {ServiceBase}
     */
    private _instance: ServiceBase;

    /**
     * initialize instance
     * @param {Function} factory factory function
     * @param {boolean} isShared is service shared? (one shared instance)
     */
    public constructor(factory: Function, isShared: boolean) {
        this._instance = null;
        this._shared = isShared;
        this._factory = factory;
    }

    /**
     * get instance of the service
     * @return {ServiceBase} instance
     */
    public getInstance(): ServiceBase {
        if (this._shared)
            return this._getOrCreateSharedInstance();
        else
            return this.createInstance();
    }

    /**
     * is service shared?
     * @return {boolean} true if shared
     */
    public isShared() : boolean {
        return  this._shared;
    }

    /**
     * create new instance of the service
     * @return {ServiceBase} new instance of the service
     */
    public createInstance(): ServiceBase {
        let instance: ServiceBase;
        instance = this._factory();

        return instance;
    }

    /**
     * get shred instance
     * if instance was not created yet, create new one
     * @return {ServiceBase} instance of the service
     */
    private _getOrCreateSharedInstance() : ServiceBase {
        if (this._instance === null)
            this._instance = this.createInstance();

        return this._instance;
    }
}

/**
 * hold other namespaces and services
 */
export class ServiceNamespace {

    [index: string]: Object;

    public getNamespace(nsName: string) : ServiceNamespace {
        let result: ServiceNamespace = null;

        try {
            result = this._getNamespace(nsName);
        }
        catch (err) {
            this._newNamespace(nsName);
            result = this._getNamespace(nsName);
        }

        return result;
    }

    /**
     * register service container to the namespace
     * @param {string} name name of the service container
     * @param {ServiceContainer} container instance of the service container
     */
    public registerServiceContainer(name: string, container: ServiceContainer) : void {
        this[name] = function () {
            return container.getInstance();
        }
    }

    /**
     * get namespace from the lookup
     * throw error if namespace is not registered
     * @param {string} nsName name of the namespace
     * @return {ServiceNamespace} sub namespace
     * @throws LookupError namespace is unknown
     */
    private _getNamespace(nsName: string) : ServiceNamespace {
        let ns: ServiceNamespace = <ServiceNamespace>this[nsName];

        // ns has to be found
        if (ns === undefined)
            throw new LookupError("Service named '" + nsName + "' not found.");

        return ns;
    }

    /**
     * create new namespace and register it into lookup
     * @param {string} nsName [description]
     */
    private _newNamespace(nsName: string) : void {
        let ns: ServiceNamespace = new ServiceNamespace();

        this[nsName] = ns;
    }
}

/**
 * manage services
 */
export class ServiceManager {

    private _rootNamespace: ServiceNamespace;

    constructor(rootNamespace: ServiceNamespace=null) {
        if (rootNamespace == null)
            rootNamespace = new ServiceNamespace();

        this._rootNamespace = rootNamespace;
    }

    /**
     * register new service into manager
     * @param {string} path path to service
     * @param {Function} factory factory function
     * @param {boolean=true} isShared true if service is shared
     */
    public registerService(path: string, factory: Function, isShared:boolean=true) : void {
        let pathInfo: ServicePathInfo = this._splitPath(path);
        let ns: ServiceNamespace = this._getNamespaceByPathArray(pathInfo.pathParts);

        let container: ServiceContainer = new ServiceContainer(factory, isShared);
        ns.registerServiceContainer(pathInfo.serviceName, container);
    }

    /**
     * get namespace defined by path. If namespace does not exist, create new one
     * @param {string} path path to final namespace
     * @return {ServiceNamespace} target namespace
     */
    public getNamespaceByPath(path: string) : ServiceNamespace {
        let parts: string[] = path.split(".");
        return this._getNamespaceByPathArray(parts);
    }

    /**
     * get service by path
     * @param {string} path path to service
     * @return {ServiceBase} service instance
     */
    public getServiceByPath(path: string) : ServiceBase {
        let pathInfo: ServicePathInfo = this._splitPath(path);
        let ns: ServiceNamespace = this._getNamespaceByPathArray(pathInfo.pathParts);
        let factory: Function = <Function>ns[pathInfo.serviceName];

        if (!factory)
            throw new LookupError("Service '" + pathInfo.serviceName + "' not found");

        let result: ServiceBase = <ServiceBase>(<Function>ns[pathInfo.serviceName])();
        return result;
    }

    public get rootNamespace(): ServiceNamespace {
        return this._rootNamespace;
    }

    /**
     * get namespace identified by array path
     * @param {string[]} pathArray array path
     * @return {ServiceNamespace} namespace
     */
    private _getNamespaceByPathArray(pathArray: string[]) : ServiceNamespace {
        let current: ServiceNamespace = this._rootNamespace;
        pathArray.forEach((nsName: string) => {
            current = current.getNamespace(nsName);
        });

        return current;
    }

    /**
     * split path to namespace path and service name
     * @param {string} path original path
     * @return {ServicePathInfo} splitted path
     */
    private _splitPath(path: string) : ServicePathInfo {
        let result: ServicePathInfo = new ServicePathInfo();

        let parts: Array<string> = path.split(".");

        result.serviceName = parts[parts.length - 1];
        result.pathParts = <Array<string>>parts.slice(0, parts.length - 1);

        return result;
    }
}

/**
 * hold information about path to service
 */
class ServicePathInfo {

    /**
     * name of the service
     * @type {string}
     */
    private _serviceName : string;
    public get serviceName() : string {
        return this._serviceName;
    }
    public set serviceName(v : string) {
        this._serviceName = v;
    }

    /**
     * parts of path to service trougth the namespaces
     * @type {Array<string>}
     */
    private _pathParts : Array<string>;
    public get pathParts() : Array<string> {
        return this._pathParts;
    }
    public set pathParts(v : Array<string>) {
        this._pathParts = v;
    }

}
