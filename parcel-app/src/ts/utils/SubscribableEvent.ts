/**
 * STOLEN FROM XORUS LOL
 */

export class SubscribableEvent<T> {
    public readonly subscribers: ((data: T) => void)[] = [];
    public on(callback: ((data: T) => void)) {
        console.log("Subscribing to event", this);
        this.subscribers.push(callback);
    }
    public off(callback: ((data: T) => void)) {
        const index = this.subscribers.indexOf(callback);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }
    public fire(data: T) {
        console.log("Firing event", data, this);
        for (const callback of this.subscribers) {
            callback(data);
        }
    }
}

export const coolShit = new SubscribableEvent<string>();