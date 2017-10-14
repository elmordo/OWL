import { EventDispatcher, Event } from "../../../src/events";
import { expect } from "chai";


describe("EventDispatcher class", () => {

    function addSimpleListener(dispatcher: EventDispatcher, eventType: string) {
        let wasCalled = false;
        dispatcher.addEventListener(eventType, (evt) => { wasCalled = true; });
        return (expectedCalled: boolean) => {
            expect(wasCalled).to.equal(expectedCalled);
        }
    }

    it("Add event listener and dispatch", () => {
        let dispatcher: EventDispatcher = new EventDispatcher();
        let eventType: string = "myEvent";

        let resolver: Function = addSimpleListener(dispatcher, eventType);

        let event: Event = new Event(eventType);
        dispatcher.dispatchEvent(event);

        resolver(true);
    });

    it("Add more event listeners of the same type and dispatch", () => {
        let dispatcher: EventDispatcher = new EventDispatcher();
        let eventType: string = "myEvent";

        let resolver1 = addSimpleListener(dispatcher, eventType);
        let resolver2 = addSimpleListener(dispatcher, eventType);

        let event: Event = new Event(eventType);
        dispatcher.dispatchEvent(event);

        resolver1(true);
        resolver1(true);
    });

    it("Dispatch event with no listeners", () => {
        let dispatcher: EventDispatcher = new EventDispatcher();
        let eventType: string = "myEvent";
        let resolver = addSimpleListener(dispatcher, "notMyEvent");

        let event: Event = new Event(eventType);
        dispatcher.dispatchEvent(event);

        resolver(false);
    });

    it("Add more event listeners and some on different event and dispatch", () => {
        let dispatcher: EventDispatcher = new EventDispatcher();
        let eventType: string = "myEvent";

        let resolver1 = addSimpleListener(dispatcher, eventType);
        let resolver2 = addSimpleListener(dispatcher, eventType);
        let resolver3 = addSimpleListener(dispatcher, "notMyEvent");

        let event: Event = new Event(eventType);
        dispatcher.dispatchEvent(event);

        resolver1(true);
        resolver2(true);
        resolver3(false);
    });

    it("Event chain", () => {
        let dispatcher = new EventDispatcher();
        let eventType1 = "firstEvent", eventType2 = "secondEvent";
        let event1 = new Event(eventType1), event2 = new Event(eventType2);

        let counter: number = 1;
        let firstEventOrder = 0, secondEventOrder = 0;

        dispatcher.addEventListener(eventType1, () => {
            firstEventOrder = counter++;
            dispatcher.dispatchEvent(event2);
        });

        dispatcher.addEventListener(eventType2, () => {
            secondEventOrder = counter++;
        });

        dispatcher.dispatchEvent(event1);

        expect(firstEventOrder).to.eq(1);
        expect(secondEventOrder).to.eq(2);
    });
});

