import { HttpMethod } from "../enums/http-method";

export interface IRouter {
    method: HttpMethod;
    path: string;
    name: string | symbol;
    order?: number
}