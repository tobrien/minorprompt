export interface Weighted {
    text: string;
    weight?: number;
}

export const create = <T extends Weighted>(text: string): T => {
    return {
        text,
    } as T;
}