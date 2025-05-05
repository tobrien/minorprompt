import { Weighted, create as createWeighted } from "./weighted";

export interface Section<T extends Weighted> {
    title?: string;
    items: (T | Section<T>)[];
    add: (item: T | Section<T> | string) => Section<T>;
    append: (item: T | Section<T> | string) => Section<T>;
    prepend: (item: T | Section<T> | string) => Section<T>;
    insert: (index: number, item: T | Section<T> | string) => Section<T>;
    remove: (index: number) => Section<T>;
    replace: (index: number, item: T | Section<T> | string) => Section<T>;
}

export const isSection = (object: any): boolean => {
    return object && typeof object === 'object' && 'items' in object;
}

export const convertToSection = (object: any): Section<Weighted> => {
    if (isSection(object)) {
        const section = create(object.title);
        object.items.forEach((item: any) => {
            if (isSection(item)) {
                section.append(convertToSection(item));
            } else {
                section.append(createWeighted(item.text));
            }
        });
        return section;
    } else {
        throw new Error('Object is not a section');
    }
}

export const create = <T extends Weighted>(title: string): Section<T> => {
    const items: (T | Section<T>)[] = [];

    const append = (item: T | Section<T> | string): Section<T> => {
        if (typeof item === 'string') {
            items.push(createWeighted<T>(item));
        } else {
            items.push(item);
        }
        return section;
    }

    const prepend = (item: T | Section<T> | string): Section<T> => {
        if (typeof item === 'string') {
            items.unshift(createWeighted<T>(item));
        } else {
            items.unshift(item);
        }
        return section;
    }

    const insert = (index: number, item: T | Section<T> | string): Section<T> => {
        if (typeof item === 'string') {
            items.splice(index, 0, createWeighted<T>(item));
        } else {
            items.splice(index, 0, item);
        }
        return section;
    }

    const remove = (index: number): Section<T> => {
        items.splice(index, 1);
        return section;
    }

    const replace = (index: number, item: T | Section<T> | string): Section<T> => {
        if (typeof item === 'string') {
            items[index] = createWeighted<T>(item);
        } else {
            items[index] = item;
        }
        return section;
    }

    const add = (item: T | Section<T> | string): Section<T> => {
        return append(item);
    }

    const section: Section<T> = {
        title,
        items,
        add,
        append,
        prepend,
        insert,
        remove,
        replace,
    }

    return section;
}


