
import { EventDispatcher, OwlEvent } from "./events"


export type WatchdogEventFactory = (dispatcher: EventDispatcher, diff: WatchResult) => OwlEvent;


export class PropertyWatchdog {

    private _dispatcher: EventDispatcher;

    private _watchedObject: Object;

    private _lastData: Object;

    private _eventFactory: WatchdogEventFactory;

    constructor(dispatcher: EventDispatcher, eventFactory: WatchdogEventFactory, watchedObject: Object, watchedProperties: string[]) {
        this._dispatcher = dispatcher;
        this._eventFactory = eventFactory;
        this._watchedObject = watchedObject;
        this._lastData = new Object();
        watchedProperties.forEach((p) => { this._lastData[p] = watchedObject[p]; }, this);
    }

    public watch() : void {
        let currentState: Object = this._getCurrentState();
        let diff: Object, changeFound: boolean;
        let result = this._resolveStatus(currentState);

        this._resolveResult(result);
        this._lastData = currentState;
    }

    private _getCurrentState() : Object {
        let result: Object = {};

        for (let p in this._lastData)
            result[p] = this._watchedObject[p];

        return result;
    }

    private _resolveStatus(newState: Object): WatchResult {
        let found: boolean = false
        let diff: Object = new Object();

        for (let k in newState) {
            if (newState[k] != this._lastData[k]) {
                found = true;
                diff[k] = new WatchChange(this._lastData[k], newState[k]);
            }
        }

        return new WatchResult(diff, found);
    }

    private _resolveResult(result: WatchResult) : void {
        if (result.changeFound) {
            // chagne was found, create event
            let event = this._eventFactory(this._dispatcher, result);
            this._dispatcher.dispatchEvent(event);
        }
    }
}


export class WatchChange {

    public oldValue;

    public newValue;

    constructor(oldValue, newValue) {
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}


export class WatchResult {

    public diff: Object;

    public changeFound: boolean;

    constructor(diff: Object, changeFound: boolean) {
        this.diff = diff;
        this.changeFound = changeFound;
    }
}
