
import { ServiceManager, ServiceBase } from "../../../src/service_management"
import { expect } from "chai"


class Foo {

}


describe("Test service manager", () => {
    it("try to get namespace by path", () => {
        let sm = new ServiceManager();
        let nsParts: string[] = [ "ns1", "ns2", "ns3" ];
        let nsPath = nsParts.join(".");

        let finalNs = sm.rootNamespace.getNamespace(nsParts[0]).getNamespace(nsParts[1]).getNamespace(nsParts[2]);
        let ns = sm.getNamespaceByPath(nsPath);

        expect(ns === finalNs).true;
    });

    it("try to get service by path when service does not exist", () => {
        let sm = new ServiceManager();
        let path = "ns1.ns2.service";
        expect(() => { sm.getServiceByPath(path) }).throw();
    });

    it("try to get service by path when service exist", () => {
        let sm = new ServiceManager();
        let path = "ns1.ns2.service";
        sm.registerService(path, () => {});

        expect(() => { sm.getServiceByPath(path) }).not.throw();
    });

    it("try to create instance of the shared service", () => {
        let sm = new ServiceManager();
        let path = "ns1.service";

        sm.registerService(path, () => { return new Foo(); });

        let instance1 = sm.getServiceByPath(path);
        let instance2 = sm.getServiceByPath(path);

        expect(instance1 === instance2).true;
    });

    it("try to create instance of the not shared service", () => {
        let sm = new ServiceManager();
        let path = "ns1.subns.subsubns.service";

        sm.registerService(path, () => { return new Foo(); }, false);

        let instance1 = sm.getServiceByPath(path);
        let instance2 = sm.getServiceByPath(path);

        expect(instance1 === instance2).false;
    });

});
