import { ElementHandle, Page, BoundingBox } from 'puppeteer';
import { Vector } from './math';
export { default as installMouseHelper } from './mouse-helper';
interface BoxOptions {
    readonly paddingPercentage: number;
}
interface MoveOptions extends BoxOptions {
    readonly iframe?: string;
    readonly waitForIframe?: boolean;
    readonly waitForSelector: boolean;
}
interface ClickOptions extends MoveOptions {
    readonly waitForClick: number;
}
export interface GhostCursor {
    toggleRandomMove: (random: boolean) => void;
    click: (selector?: string | ElementHandle, options?: ClickOptions) => Promise<void>;
    move: (selector: string | ElementHandle, options?: MoveOptions) => Promise<void>;
    moveTo: (destination: Vector) => Promise<void>;
}
declare module 'puppeteer' {
    interface Page {
        _client: {
            send: (name: string, params: {}) => Promise<any>;
        };
    }
    interface Target {
        _targetId: string;
    }
    interface ElementHandle {
        _remoteObject: {
            objectId: string;
        };
    }
    interface ExecutionContext {
        frame: () => Frame;
    }
}
export declare const getRandomPagePoint: (page: Page) => Promise<Vector>;
export declare function path(point: Vector, target: Vector, spreadOverride?: number): any;
export declare function path(point: Vector, target: BoundingBox, spreadOverride?: number): any;
export declare const createCursor: (page: Page, start?: Vector, performRandomMoves?: boolean) => GhostCursor;
