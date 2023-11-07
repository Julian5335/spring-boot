import { MetadataKeys } from "../enums/metadata-keys"
import IErrorHandler from "../models/ierrorhandler";

export const errorHandler = (errorClass: any): MethodDecorator => {
    return (target, propertyKey) => {
        const errorHandlerClass = target.constructor;

        let errorHandlers: IErrorHandler[] = []
        const metadataExists = Reflect.hasMetadata(MetadataKeys.ERROR_HANDLERS, errorHandlerClass)
        if (metadataExists) {
            errorHandlers = Reflect.getMetadata(MetadataKeys.ERROR_HANDLERS, errorHandlerClass) as IErrorHandler[]
        }

        const errorHandler: IErrorHandler = { name: propertyKey, errorClass }
        errorHandlers.push(errorHandler)
        Reflect.defineMetadata(MetadataKeys.ERROR_HANDLERS, errorHandlers, errorHandlerClass)
    }
}