
import * as serviceBase from "./ServiceBase";

type ServiceBase = serviceBase.OOW.Service.ServiceBase;

namespace OOW.Service {


    /**
     * provides service instance
     */
    export class ServiceContainer {

        /**
         * factory function
         * @type {Function} factory function
         */
        private factory: Function;

        /**
         * is service shared?
         * @type {boolean}
         */
        private shared: boolean;

        /**
         * cached instance of the shared service
         * @type {ServiceBase}
         */
        private instance: ServiceBase;

        /**
         * initialize instance
         * @param {Function} factory factory function
         * @param {boolean} isShared is service shared? (one shared instance)
         */
        public constructor(factory: Function, isShared: boolean) {
            this.instance = null;
            this.shared = isShared;
            this.factory = factory;
        }

        /**
         * get instance of the service
         * @return {ServiceBase} instance
         */
        public getInstance(): ServiceBase {
            if (this.shared)
                return this.getOrCreateSharedInstance();
            else
                return this.createInstance();
        }

        /**
         * is service shared?
         * @return {boolean} true if shared
         */
        public isShared() : boolean {
            return  this.shared;
        }

        /**
         * create new instance of the service
         * @return {ServiceBase} new instance of the service
         */
        public createInstance(): ServiceBase {
            let instance: ServiceBase;
            instance = this.factory();

            return instance;
        }

        /**
         * get shred instance
         * if instance was not created yet, create new one
         * @return {ServiceBase} instance of the service
         */
        private getOrCreateSharedInstance() : ServiceBase {
            if (this.instance === null)
                this.instance = this.createInstance();

            return this.instance;
        }

    }

}
