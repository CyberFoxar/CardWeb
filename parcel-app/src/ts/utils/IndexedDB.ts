import { Rule } from "../models/Index.model";

export class IndexedDB {
    private dbName: string = 'cw-indexed-db';
    private dbVersion: number = 1;
    private db: IDBDatabase | undefined;

    constructor() {
        if (!window.indexedDB) {
            console.log("Your browser doesn't support a stable version of IndexedDB. Offline storage of rules will not work.");
        }
        this.openDB();
    }

    /**
     * Opens the DB and return a Promise with the db object.
     * @param callback 
     */
    public openDB(ver: number = this.dbVersion): Promise<IDBDatabase> {
        this.dbVersion = ver;
        const req = window.indexedDB.open(this.dbName, this.dbVersion);

        return new Promise((resolve, reject) => {
            req.onsuccess = (event: Event) => {
                this.db = req.result;
                resolve(req.result);
            };
            req.onerror = (event: Event) => {
                console.error('error opening indexedDB', event);
                reject(req.error);
            };
            req.onupgradeneeded = async (event: Event) => {
                console.warn("upgrading indexedDB");
                this.db = req.result;
                await this.initDB();
                resolve(req.result);
            };
        });
    }

    /**
     * Initialize the DB: create an object store for our rules and return a promise with it.
     * @param callback 
     */
    public initDB(): Promise<IDBObjectStore> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject("DB not initialized");
                return;
            }
            const store = this.db.createObjectStore('saved-rules-fr', { keyPath: 'id' });
            store.createIndex('id', 'id', { unique: true });
            store.transaction.oncomplete = (event: Event) => {
                console.log('store created');
                resolve(store);
            };
            store.transaction.onerror = (event: Event) => {
                console.error('error creating store', event);
                reject(store.transaction.error);
            };
        });
    }

    public addRule(rule: Rule): Promise<IDBValidKey> {
        return this.storeOperation('saved-rules-fr', 'readwrite', (store) => store.add(rule));
    }

    public deleteRule(id: string): Promise<void> {
        return this.storeOperation('saved-rules-fr', 'readwrite', (store) => store.delete(id));
    }

    public putRule(rule: Rule): Promise<void> {
        return this.storeOperation('saved-rules-fr', 'readwrite', (store) => store.put(rule));
    }

    public getRule(id: string): Promise<Rule> {
        console.log("getting rule", id);
        return this.storeOperation('saved-rules-fr', 'readonly', (store) => store.get(id));
    }

    public getAllRules(): Promise<Rule[]> {
        return this.storeOperation('saved-rules-fr', 'readonly', (store) => store.getAll())
    }

    /**
     * Execute a request operation on the given store.
     * @param storeName 
     * @param mode 
     * @param operation 
     * @returns Promisified version of the transaction with either the transation result in resolve or the transaction error in reject
     */
    private storeOperation<T>(storeName: string, mode: IDBTransactionMode = 'readonly', operation: (store: IDBObjectStore) => IDBRequest): Promise<T>{
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject("DB not initialized");
                return;
            }
            const tx = this.db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const req = operation(store);
            req.onsuccess = (event: Event) => {
                resolve(req.result);
            };
            req.onerror = (event: Event) => {
                reject(req.error);
            };
        });
    }

}