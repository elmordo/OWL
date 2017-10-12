
export namespace OOW {

    export class Event {

        public readonly type: string;

        public readonly target: EventDispatcher;

    }

    export class EventDispatcher {

    }

    type HandlerList = Array<Function>;

    class EventHandlerLookup {
        [key: string]: HandlerList;
    }

}