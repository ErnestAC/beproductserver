//errorLog.js is meant to provide additonal detail on an error that would otherwise normally be sent to console.log

export const errorLog = (err, req) => {
    const error = {
        path: `[${err.method}] ${err.originalUrl}`,
        error: err.message,
        files: err.stack
    };

    console.log(error);
}