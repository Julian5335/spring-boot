import express, { Handler, NextFunction, Request, Response } from 'express';
import "reflect-metadata";
import methodDecoratorFactory from './core/decorators/methods';
import { HttpMethod } from './core/enums/http-method';
import { MetadataKeys } from './core/enums/metadata-keys';
import IRouter from './core/models/irouter';
import { errorHandler } from './core/decorators/error.handler';
import IErrorHandler from './core/models/ierrorhandler';
import cors, { CorsOptions } from "cors";

export const ErrorHandler = errorHandler

export class HandledError extends Error {
    status = 500
    errors: { [key: string]: string }
    constructor(errors: { [key: string]: string }, status?: number) {
        super("handled error")
        this.errors = errors
        if (status) this.status = status
    }
}

export class Config {
    controllers: any[] = []
    cors?: CorsOptions
    errorHandlerClass?: any
}

export const Controller = (basePath: string): ClassDecorator => {
    return target =>  Reflect.defineMetadata(MetadataKeys.BASE_PATH, basePath, target)
}

export const Get = methodDecoratorFactory(HttpMethod.GET);
export const Post = methodDecoratorFactory(HttpMethod.POST);
export const Put = methodDecoratorFactory(HttpMethod.PUT);
export const Delete = methodDecoratorFactory(HttpMethod.DELETE);
export const Middleware = methodDecoratorFactory(HttpMethod.MIDDLEWARE)

export default class App {

    readonly instance = express();
    private controllerClasses: any[]
    private errorHandlerClass?: any
    private corsOptions?: CorsOptions

    constructor(config: Config) {
        this.controllerClasses = config.controllers
        this.errorHandlerClass = config.errorHandlerClass
        this.corsOptions = config.cors
        this.registerMiddleware()
        this.registerRouters();
        this.useErrorHandlers()
    }
    
    private registerMiddleware() {
        this.instance.use(cors(this.corsOptions))
        this.instance.use(express.json())
    }

    private registerRouters() {
        // Health
        this.instance.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'OK' });
        });

        // Register routers
        this.controllerClasses.forEach(controllerClass => {
            this.createRouteFrom(controllerClass)
        });
    }

    private createRouteFrom(controllerClass: any) {
        const controllerInstance: { [name: string]: Handler } = new controllerClass() as any;

        const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
        const routes: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

        // Separate into middlewares and routes
        const httpRoutes: IRouter[] = []
        const middlewares: IRouter[] = []
        routes.forEach(x => {
            if (x.method == HttpMethod.MIDDLEWARE) {
                middlewares.push(x)
                return
            }
            httpRoutes.push(x)
        })

        // Arrange middleware in order
        middlewares.sort((x1, x2) => x1.order! - x2.order!)
        
        const router = express.Router();

        // Add middlewares first
        [...middlewares, ...httpRoutes].forEach(route => {
            const { method, path, name} = route
            router[method](path, this.catchWrap(controllerInstance[String(name)], controllerInstance));
        });

        this.instance.use(basePath, router);
    }

    private catchWrap(originalFunction: Handler, controllerInstance: {[name: string]: Handler}) {
        return async function(req: Request, res: Response, next: NextFunction) {
            try {
                return await originalFunction.call(controllerInstance, req, res, next);
            } catch (e) {
                next(e);
            }
        };
    }

    private useErrorHandlers() {
        if (this.errorHandlerClass) {
            const errorHandlerInstance = new this.errorHandlerClass() as any;
            const metadata: IErrorHandler[] = Reflect.getMetadata(MetadataKeys.ERROR_HANDLERS, this.errorHandlerClass)
            metadata.forEach(x => {
                const handlerName = x.name
                const errorClass = x.errorClass
                this.instance.use((e: Error, req: Request, res: Response, next: NextFunction) => {
                    if (e instanceof errorClass) {
                        const h: Function = errorHandlerInstance[String(handlerName)]
                        return h(req, res, e)
                    }
                    next(e)
                })
            })
        }
        const errorHandler = (e: Error, req: Request, res: Response, next: NextFunction) => {
            if (e instanceof HandledError) {
                return res.status(e.status).json({ errors : e.errors })
            }
            console.log(e.name, e.stack);
            return res.status(500).json({ errors: { _: "Internal server error" } })
        }
        this.instance.use(errorHandler)
    }

}