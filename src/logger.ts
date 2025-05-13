import { LIBRARY_NAME } from "./constants";

export interface Logger {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    verbose: (message: string, ...args: any[]) => void;
    silly: (message: string, ...args: any[]) => void;
}

export const DEFAULT_LOGGER: Logger = {
    // eslint-disable-next-line no-console
    debug: (message: string, ...args: any[]) => console.debug(message, ...args),
    // eslint-disable-next-line no-console
    info: (message: string, ...args: any[]) => console.info(message, ...args),
    // eslint-disable-next-line no-console
    warn: (message: string, ...args: any[]) => console.warn(message, ...args),
    // eslint-disable-next-line no-console
    error: (message: string, ...args: any[]) => console.error(message, ...args),
    // eslint-disable-next-line no-console
    verbose: (message: string, ...args: any[]) => console.log(message, ...args),
    // eslint-disable-next-line no-console
    silly: (message: string, ...args: any[]) => console.log(message, ...args),
}

export const wrapLogger = (toWrap: Logger, name?: string): Logger => {

    const log = (level: keyof Logger, message: string, ...args: any[]) => {

        message = `[${LIBRARY_NAME}] ${name ? `[${name}]` : ''}: ${message}`;
        toWrap[level](message, ...args);
    }

    return {
        debug: (message: string, ...args: any[]) => log('debug', message, ...args),
        info: (message: string, ...args: any[]) => log('info', message, ...args),
        warn: (message: string, ...args: any[]) => log('warn', message, ...args),
        error: (message: string, ...args: any[]) => log('error', message, ...args),
        verbose: (message: string, ...args: any[]) => log('verbose', message, ...args),
        silly: (message: string, ...args: any[]) => log('silly', message, ...args),
    }
}