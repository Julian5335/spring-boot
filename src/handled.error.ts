export default class HandledError extends Error {

    status = 500
    errors: { [key: string]: string }

    constructor(errors: { [key: string]: string }, status?: number) {
        super("handled error")
        this.errors = errors
        if (status) this.status = status
    }

}