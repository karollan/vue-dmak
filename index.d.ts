import { DefineComponent, App } from 'vue';

export interface VueDmakProps {
    text: string;
    uri?: string;
    skipLoad?: boolean;
    autoplay?: boolean;
    renderAt?: number;
    height?: number;
    width?: number;
    viewBox?: { x: number; y: number; w: number; h: number };
    step?: number;
    stroke?: {
        animated?: {
            drawing?: boolean;
            erasing?: boolean;
        };
        order?: {
            visible?: boolean;
            attr?: Record<string, string | number>;
        };
        attr?: Record<string, string | number>;
    };
    grid?: {
        show?: boolean;
        attr?: Record<string, string | number>;
    };
}

export const VueDmak: DefineComponent<VueDmakProps, {}, {}, {}, {
    render(end?: number): void;
    pause(): void;
    erase(end?: number): void;
    eraseLastStrokes(nbStrokes: number): void;
    renderNextStrokes(nbStrokes: number): void;
}>;

export class Dmak {
    constructor(text: string, options: any, Raphael: any);
    render(end?: number): void;
    pause(): void;
    erase(end?: number): void;
    eraseLastStrokes(nbStrokes: number): void;
    renderNextStrokes(nbStrokes: number): void;
    static VERSION: string;
}

export class DmakLoader {
    constructor(uri: string);
    load(text: string, callback: (paths: any[]) => void): void;
}

export function install(app: App): void;

declare const _default: {
    VueDmak: typeof VueDmak;
    Dmak: typeof Dmak;
    DmakLoader: typeof DmakLoader;
    install: typeof install;
};

export default _default;
