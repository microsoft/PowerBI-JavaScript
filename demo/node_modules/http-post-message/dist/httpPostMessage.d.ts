/*! http-post-message v0.2.3 | (c) 2016 Microsoft Corporation MIT */
export interface IHttpPostMessageRequest {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    headers: any;
    body?: any;
}
export interface IHttpPostMessageResponse<T> {
    statusCode: number;
    statusText: string;
    headers: any;
    body: T;
}
export interface IPostMessage {
    postMessage<T>(window: Window, message: any): Promise<T>;
}
export declare class HttpPostMessage {
    static addTrackingProperties(message: any, trackingProperties: any): any;
    static getTrackingProperties(message: any): any;
    static isErrorMessage(message: any): boolean;
    defaultHeaders: any;
    defaultTargetWindow: Window;
    windowPostMessageProxy: IPostMessage;
    constructor(windowPostMessageProxy: IPostMessage, defaultHeaders?: any, defaultTargetWindow?: Window);
    get<T>(url: string, headers?: any, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    post<T>(url: string, body: any, headers?: any, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    put<T>(url: string, body: any, headers?: any, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    patch<T>(url: string, body: any, headers?: any, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    delete<T>(url: string, body?: any, headers?: any, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    send<T>(request: IHttpPostMessageRequest, targetWindow?: Window): Promise<IHttpPostMessageResponse<T>>;
    /**
     * Object.assign() polyfill
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     */
    private assign(target, ...sources);
}
