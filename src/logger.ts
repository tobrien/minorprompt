/* eslint-disable no-console */
import { z } from "zod";
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
    debug: (message: string, ...args: any[]) => console.debug(message, ...args),
    info: (message: string, ...args: any[]) => console.info(message, ...args),
    warn: (message: string, ...args: any[]) => console.warn(message, ...args),
    error: (message: string, ...args: any[]) => console.error(message, ...args),
    verbose: (message: string, ...args: any[]) => console.log(message, ...args),
    silly: (message: string, ...args: any[]) => console.log(message, ...args),
}

export const wrapLogger = (toWrap: Logger, name?: string): Logger => {

    const requiredMethods: (keyof Logger)[] = ['debug', 'info', 'warn', 'error', 'verbose', 'silly'];
    const missingMethods = requiredMethods.filter(method => typeof toWrap[method] !== 'function');

    if (missingMethods.length > 0) {
        throw new Error(`Logger is missing required methods: ${missingMethods.join(', ')}`);
    }

    const log = (level: keyof Logger, message: string, ...args: any[]) => {
        message = `[${LIBRARY_NAME}] ${name ? `[${name}]` : ''}: ${message}`;

        if (level === 'debug') toWrap.debug(message, ...args);
        else if (level === 'info') toWrap.info(message, ...args);
        else if (level === 'warn') toWrap.warn(message, ...args);
        else if (level === 'error') toWrap.error(message, ...args);
        else if (level === 'verbose') toWrap.verbose(message, ...args);
        else if (level === 'silly') toWrap.silly(message, ...args);
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