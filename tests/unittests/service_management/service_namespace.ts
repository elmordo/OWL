import { ServiceNamespace } from "../../../src/service_management"
import { expect } from "chai"


describe("Service namespace", () => {

    it("Get namespace", () => {
        let rootNs = new ServiceNamespace();
        let ns = rootNs.getNamespace("prdel");

        expect(ns).instanceof(ServiceNamespace);
        expect(ns !== rootNs).is.true;
    });

    it("Get namespace twice", () => {
        let rootNs = new ServiceNamespace();
        let ns1 = rootNs.getNamespace("prdel");
        let ns2 = rootNs.getNamespace("prdel");

        expect(ns1 === ns2).is.true;

    });
});
