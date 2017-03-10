/*! powerbi-router v0.1.5 | (c) 2016 Microsoft Corporation MIT */
interface IAddHandler {
    addHandler(handler: any): void;
}
interface IRouterHandler {
    (request: IExtendedRequest, response: Response): void | Promise<void>;
}
declare class Router {
    private handlers;
    private getRouteRecognizer;
    private patchRouteRecognizer;
    private postRouteRecognizer;
    private putRouteRecognizer;
    private deleteRouteRecognizer;
    constructor(handlers: IAddHandler);
    get(url: string, handler: IRouterHandler): this;
    patch(url: string, handler: IRouterHandler): this;
    post(url: string, handler: IRouterHandler): this;
    put(url: string, handler: IRouterHandler): this;
    delete(url: string, handler: IRouterHandler): this;
    /**
     * TODO: This method could use some refactoring.  There is conflict of interest between keeping clean separation of test and handle method
     * Test method only returns boolean indicating if request can be handled, and handle method has opportunity to modify response and return promise of it.
     * In the case of the router with route-recognizer where handlers are associated with routes, this already guarantees that only one handler is selected and makes the test method feel complicated
     * Will leave as is an investigate cleaner ways at later time.
     */
    private registerHandler(routeRecognizer, method, url, handler);
}
interface IExtendedRequest extends IRequest {
    params: any;
    queryParams: any;
    handler: any;
}
interface IRequest {
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;
    headers: {
        [key: string]: string;
    };
    body: any;
}
interface IResponse {
    statusCode: number;
    headers?: {
        [key: string]: string;
    };
    body: any;
}
declare class Response implements IResponse {
    statusCode: number;
    headers: any;
    body: any;
    constructor();
    send(statusCode: number, body?: any): void;
}
