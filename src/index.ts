import express, { Handler } from 'express';
import "reflect-metadata";
import methodDecoratorFactory from './core/decorators/methods';
import { HttpMethod } from './core/enums/http-method';
import { MetadataKeys } from './core/enums/metadata-keys';
import { IRouter } from './core/models/irouter';

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
    private controllers: any[] = []

    constructor(controllers: any[], middleware: any[] = []) {
        this.controllers = controllers
        this.registerMiddleware()
        this.registerRouters();
    }
    
    private registerMiddleware() {
        this.instance.use(express.json())
    }

    private registerRouters() {
        // Health
        this.instance.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'OK' });
        });

        // Register routers
        this.controllers.forEach(controllerClass => {
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
            router[method](path, controllerInstance[String(name)].bind(controllerInstance));
        });

        this.instance.use(basePath, router);
    }

}