import { HttpMethod } from "../enums/http-method";
import { MetadataKeys } from "../enums/metadata-keys";
import { IRouter } from "../models/irouter";

interface RouterMethodInput {
    path: string,
    order?: number
}

const methodDecoratorFactory = (method: HttpMethod, order?: number) => {
    if (order && method != HttpMethod.MIDDLEWARE) {
        throw new Error("order is only usable with middleware")
    }
    return (input?: RouterMethodInput | string): MethodDecorator => {
        let path = ""
        let order = 0
        if (!input) {
            // Do nothing
        } else if (typeof input == 'string') {
            path = input
        } else {
            path = input.path
            order = input.order ?? 0
        }

        return (target, propertyKey) => {
            const controllerClass = target.constructor;
            
            // Get existing routers from metadata
            let routers: IRouter[] = []
            const routersMetadataKeyExists = Reflect.hasMetadata(MetadataKeys.ROUTERS, controllerClass)
            if (routersMetadataKeyExists) {
                routers = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass) as IRouter[]
            }

            // Add new router and saves new list of routers to metadata
            const router: IRouter = { 
                method, 
                path: path ?? '', 
                name: propertyKey, 
                order: order ?? 0 
            }
            routers.push(router);
            Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
        }
    }
}

export default methodDecoratorFactory