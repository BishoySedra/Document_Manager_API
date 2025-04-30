export class AppResponse {
    static format(status: number, message: string, body: any = null) {
        return { status, message, body };
    }

    static isFormatted(data: any): boolean {
        return (typeof data === 'object' && data !== null && 'status' in data && 'message' in data && 'body' in data);
    }
}
