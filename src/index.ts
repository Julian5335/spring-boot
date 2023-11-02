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

export default class App {

    readonly instance = express();
    private controllers: any[] = []

    constructor(controllers: any[]) {
        this.instance.use(express.json());
        this.controllers = controllers
        this.registerRouters();
    }

    private registerRouters() {

        // Health
        this.instance.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'OK' });
        });

        // Register routers
        const info: { api: string, handler: string }[] = [];

        this.controllers.forEach((controllerClass) => {
            const controllerInstance: { [name: string]: Handler } = new controllerClass() as any;

            const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
            const routes: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

            const router = express.Router();

            routes.forEach(({ method, path, name}) => {
                router[method](path, controllerInstance[String(name)].bind(controllerInstance));
                info.push({
                    api: `${method.toLocaleUpperCase()} ${basePath + path}`,
                    handler: `${controllerClass.name}.${String(name)}`,
                });
            });
            this.instance.use(basePath, router);
        });
        console.table(info);
    }
}