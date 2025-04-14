export class AppResponse {
    static format(status: number, message: string, body: any = null) {
        return {
            status,
            message,
            body,
        };
    }
}
