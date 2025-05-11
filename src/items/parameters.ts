export interface Parameters {
    [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

export const create = (parameters: Parameters): Parameters => {
    return parameters;
}

export const apply = (text: string, parameters?: Parameters): string => {
    if (!parameters) {
        return text;
    }

    return text.replace(/\{\{([^{}]+)\}\}/g, (match, p1) => {
        const parameter = parameters[p1];
        if (typeof parameter === 'string') {
            return parameter;
        } else if (typeof parameter === 'number') {
            return parameter.toString();
        } else if (typeof parameter === 'boolean') {
            return parameter.toString();
        } else if (Array.isArray(parameter)) {
            return parameter.join(', ');
        } else {
            return match;
        }
    });
}