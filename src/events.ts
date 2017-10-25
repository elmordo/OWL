
/**
 * represents event
 */
export class OwlEvent {

    /**
     * type of the event
     * @type {string}
     */
    public readonly type: string;

    /**
     * transfered additional data
     * @type {Object}
     */
    public readonly data: Object;

    /**
     * sender of the event
     * @type {EventDispatcher}
     */
    private _target: EventDispatcher;

    /**
     * current target (if event is bubbling)
     * @type {EventDispatcher}
     */
    private _currentTarget: EventDispatcher;

    /**
     * true if event should be propagate to upper level
     * @type {boolean}
     */
    private _propagate: boolean;

    /**
     * initialize instance
     * @param {string} type type of the event
     */
    constructor(type: string, data: Object=null) {
        this.type = type;
        this._propagate = true;
        this.data = data;
    }

    /**
     * get propagate value
     * @return {boolean} propagate flag value
     */
    get propagate() : boolean {
        return this._propagate;
    }

    /**
     * set new propagate flag value
     * @param {boolean} val new value to be set
     */
    set propagate(val: boolean) {
        this._propagate = val;
    }

    /**
     * get event target
     * @return {EventDispatcher} event target
     */
    get target(): EventDispatcher {
        return this._target;
    }

    /**
     * set event target
     * @param {EventDispatcher} val event target to set
     * @throws Error some event target is set
     */
    set target(val: EventDispatcher) {
        if (this._target)
            throw new Error("Target can not be changed");

        this._target = val;
    }

    /**
     * get current target
     * @return {EventDispatcher} current target
     */
    get currentTarget(): EventDispatcher {
        return this._currentTarget;
    }

    /**
     * set current target
     * @param {EventDispatcher} val new current target
     */
    set currentTarget(val: EventDispatcher) {
        this._currentTarget = val;
    }
}


export class DomEvent extends OwlEvent {

    public originalEvent: Event;

    constructor(evt: Event, data: Object=null) {
        super(evt.type, data);
        this.originalEvent = evt;
    }
}

/**
 * base class for all event dispatching classes
 */
export class EventDispatcher {

    /**
     * current event queue
     * @type {OwlEvent[]}
     */
    private _queue: OwlEvent[];

    /**
     * event processing flag
     * @type {boolean}
     */
    private _inDispatchProcess: boolean;

    /**
     * set of handlers
     * the key is event type
     * the value is array of handlers
     * @type {EventHandlerLookup}
     */
    private _handlers: EventHandlerLookup;

    /**
     * initialize instance
     */
    constructor() {
        this._queue = new Array<OwlEvent>();
        this._handlers = new EventHandlerLookup();
        this._inDispatchProcess = false;
    }

    /**
     * dispatch event
     * @param {OwlEvent} evt event instance to dispatch
     */
    public dispatchEvent(evt: OwlEvent): void {
        evt.target = this;
        this._queue.push(evt);

        if (!this._inDispatchProcess)
            this._processQueue();
    }

    /**
     * add event listener for event type
     * @param {string} eventType type of the event
     * @param {Function} callback function call when event is dispatched
     * @param {Object=null} context optional call context
     * @return {Function} listener remover
     */
    public addEventListener(eventType: string, callback: Function, context: Object=null) : Function {
        let handlers: EventHandler[] = this._getHandlerHolder(eventType);
        let index: number = handlers.length;

        handlers.push(new EventHandler(callback, context));
        return this._createRemover(handlers, index);
    }

    /**
     * get existing or create new holder of the event handlers
     * @param {string} eventType event type
     * @return {EventHandler[]} handler holder
     */
    private _getHandlerHolder(eventType: string) : EventHandler[] {
        if (this._handlers[eventType] === undefined)
            this._handlers[eventType] = new Array<EventHandler>();

        return this._handlers[eventType];
    }

    /**
     * create remover for element in array
     * @type {A} type of the array
     * @param {A} arr array ot remove from
     * @param {number} index index of the element to remove
     * @returns Function remover
     */
    private _createRemover<A>(arr: A, index:number) : Function {
        function remover() {
            delete arr[index];
        }

        return remover;
    }

    /**
     * process event queue
     */
    private _processQueue() : void {
        this._inDispatchProcess = true;

        try {
            while (this._queue.length) {
                let evt = this._queue.shift();
                this._processEvent(evt);
            }
        } finally {
            this._inDispatchProcess = false;
        }
    }

    /**
     * process one event
     * @param {OwlEvent} evt event to process
     */
    private _processEvent(evt: OwlEvent) : void {
        evt.currentTarget = this;
        let handlers: EventHandler[] = this._getHandlerHolder(evt.type);

        handlers.forEach(function (handler) {
            try {
                handler.handle(evt);
            } catch (err) {
                console.error(err);
            }
        });
    }
}

class EventHandlerLookup {
    [key: string]: EventHandler[];
}

/**
 * hold information about event handler
 */
class EventHandler {

    /**
     * callback function
     * @type {Function}
     */
    private _callback: Function;

    /**
     * context object (if null, window is used)
     * @type {Object}
     */
    private _context: Object;

    /**
     * initialize instance
     * @param {Function} callback callback to set
     * @param {Object=null} context context object to call callback in
     */
    constructor(callback: Function, context: Object=null) {
        this._callback = callback;
        this._context = context;
    }

    /**
     * handle event
     * @param {OwlEvent} event event to handle
     */
    public handle(event: OwlEvent) : void {
        if (this._context)
            this._callback.call(this._context, event);
        else
            this._callback(event);
    }

    /**
     * get callback instance
     * @return {Function} callback function
     */
    get callback(): Function {
        return this._callback;
    }

    /**
     * get context
     * @return {Object} context to call callback in
     */
    get context(): Object {
        return this._context;
    }
}
