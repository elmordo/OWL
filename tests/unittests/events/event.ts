import { OwlEvent } from "../../../src/events";
import { expect } from "chai";


describe("Test event class", () => {

    it("constructor", () => {
        let eventType = "myEvent";
        let e = new OwlEvent(eventType);

        expect(e.type).to.eq(eventType);
    });

});
