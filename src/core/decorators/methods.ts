import { HttpMethod } from "../enums/http-method";
import { MetadataKeys } from "../enums/metadata-keys";
import { IRouter } from "../models/irouter";

const methodDecoratorFactory = (method: HttpMethod) => {
    return (path?: string): MethodDecorator => {
        return (target, propertyKey) => {
            const controllerClass = target.constructor;
            
            // Get existing routers from metadata
            let routers: IRouter[] = []
            const routersMetadataKeyExists = Reflect.hasMetadata(MetadataKeys.ROUTERS, controllerClass)
            if (routersMetadataKeyExists) {
                routers = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass) as IRouter[]
            }

            // Add new router and saves new list of routers to metadata
            const router: IRouter = { method, path: path ?? '', name: propertyKey }
            routers.push(router);
            Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
        }
    }
}

export default methodDecoratorFactory