/*! powerbi-client v2.0.0-beta.10 | (c) 2016 Microsoft Corporation MIT */
export declare function raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void;
export declare function findIndex<T>(predicate: (x: T) => boolean, xs: T[]): number;
export declare function find<T>(predicate: (x: T) => boolean, xs: T[]): T;
export declare function remove<T>(predicate: (x: T) => boolean, xs: T[]): void;
export declare function assign(...args: any[]): any;
export declare function createRandomString(): string;
