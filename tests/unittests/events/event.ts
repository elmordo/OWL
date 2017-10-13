import { Event } from "owlonweb";
import { expect } from "chai";


describe("Test event class", () => {

    it("constructor", () => {
        let eventType = "myEvent";
        let e = new Event(eventType);

        expect(e.type).to.eq(eventType);
    });

});
