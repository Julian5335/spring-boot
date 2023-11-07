import { Request, Response } from "express"
import { ErrorHandler } from "."

export class CustomError1 extends Error { }

export class CustomError2 extends Error { }

export default class CustomErrorHandler {

    @ErrorHandler(CustomError1)
    handleCustomError1(req: Request, res: Response) {
        return res.status(403).json({ "message": "custom error 1" })
    }

    @ErrorHandler(CustomError2)
    handleCustomError2(req: Request, res: Response) {
        return res.send("<h1>Custom Error 2</h1>")
    }

}
