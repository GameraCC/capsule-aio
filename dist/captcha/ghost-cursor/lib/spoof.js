"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCursor = exports.path = exports.getRandomPagePoint = exports.installMouseHelper = void 0;
var math_1 = require("./math");
var mouse_helper_1 = require("./mouse-helper");
Object.defineProperty(exports, "installMouseHelper", { enumerable: true, get: function () { return __importDefault(mouse_helper_1).default; } });
var delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        case 1: return [2, _a.sent()];
    }
}); }); };
var fitts = function (distance, width) {
    var a = 0;
    var b = 2;
    var id = Math.log2(distance / width + 1);
    return a + b * id;
};
var getRandomBoxPoint = function (_a, options) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    var paddingWidth = 0;
    var paddingHeight = 0;
    if ((options === null || options === void 0 ? void 0 : options.paddingPercentage) !== undefined && (options === null || options === void 0 ? void 0 : options.paddingPercentage) > 0 && (options === null || options === void 0 ? void 0 : options.paddingPercentage) < 100) {
        paddingWidth = width * options.paddingPercentage / 100;
        paddingHeight = height * options.paddingPercentage / 100;
    }
    return {
        x: x + (paddingWidth / 2) + Math.random() * (width - paddingWidth),
        y: y + (paddingHeight / 2) + Math.random() * (height - paddingHeight)
    };
};
var getRandomPagePoint = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var targetId, window;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                targetId = page.target()._targetId;
                return [4, page._client.send('Browser.getWindowForTarget', { targetId: targetId })];
            case 1:
                window = _a.sent();
                return [2, getRandomBoxPoint({ x: math_1.origin.x, y: math_1.origin.y, width: window.bounds.width, height: window.bounds.height })];
        }
    });
}); };
exports.getRandomPagePoint = getRandomPagePoint;
var getElementBox = function (page, element, relativeToMainFrame) {
    if (relativeToMainFrame === void 0) { relativeToMainFrame = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var quads, _1, elementBox, elementFrame, iframes, frame, iframes_1, iframes_1_1, iframe, e_1_1, boundingBox;
        var e_1, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (element._remoteObject.objectId === undefined) {
                        return [2, null];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 5]);
                    return [4, page._client.send('DOM.getContentQuads', {
                            objectId: element._remoteObject.objectId
                        })];
                case 2:
                    quads = _c.sent();
                    return [3, 5];
                case 3:
                    _1 = _c.sent();
                    console.debug('Quads not found, trying regular boundingBox');
                    return [4, element.boundingBox()];
                case 4: return [2, _c.sent()];
                case 5:
                    elementBox = {
                        x: quads.quads[0][0],
                        y: quads.quads[0][1],
                        width: quads.quads[0][4] - quads.quads[0][0],
                        height: quads.quads[0][5] - quads.quads[0][1]
                    };
                    if (elementBox === null) {
                        return [2, null];
                    }
                    if (!!relativeToMainFrame) return [3, 16];
                    elementFrame = element.executionContext().frame();
                    return [4, ((_b = elementFrame.parentFrame()) === null || _b === void 0 ? void 0 : _b.$x('//iframe'))];
                case 6:
                    iframes = _c.sent();
                    frame = void 0;
                    if (!(iframes != null)) return [3, 14];
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 12, 13, 14]);
                    iframes_1 = __values(iframes), iframes_1_1 = iframes_1.next();
                    _c.label = 8;
                case 8:
                    if (!!iframes_1_1.done) return [3, 11];
                    iframe = iframes_1_1.value;
                    return [4, iframe.contentFrame()];
                case 9:
                    if ((_c.sent()) === elementFrame)
                        frame = iframe;
                    _c.label = 10;
                case 10:
                    iframes_1_1 = iframes_1.next();
                    return [3, 8];
                case 11: return [3, 14];
                case 12:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3, 14];
                case 13:
                    try {
                        if (iframes_1_1 && !iframes_1_1.done && (_a = iframes_1.return)) _a.call(iframes_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7];
                case 14:
                    if (!(frame !== undefined)) return [3, 16];
                    return [4, frame.boundingBox()];
                case 15:
                    boundingBox = _c.sent();
                    elementBox.x = boundingBox !== null ? elementBox.x - boundingBox.x : elementBox.x;
                    elementBox.y = boundingBox !== null ? elementBox.y - boundingBox.y : elementBox.y;
                    _c.label = 16;
                case 16: return [2, elementBox];
            }
        });
    });
};
function path(start, end, spreadOverride) {
    var defaultWidth = 100;
    var minSteps = 25;
    var width = 'width' in end ? end.width : defaultWidth;
    var curve = math_1.bezierCurve(start, end, spreadOverride);
    var length = curve.length() * 0.8;
    var baseTime = Math.random() * minSteps;
    var steps = Math.ceil((Math.log2(fitts(length, width) + 1) + baseTime) * 3);
    var re = curve.getLUT(steps);
    return clampPositive(re);
}
exports.path = path;
var clampPositive = function (vectors) {
    var clamp0 = function (elem) { return Math.max(0, elem); };
    return vectors.map(function (vector) {
        return {
            x: clamp0(vector.x),
            y: clamp0(vector.y)
        };
    });
};
var overshootThreshold = 500;
var shouldOvershoot = function (a, b) { return math_1.magnitude(math_1.direction(a, b)) > overshootThreshold; };
var createCursor = function (page, start, performRandomMoves) {
    if (start === void 0) { start = math_1.origin; }
    if (performRandomMoves === void 0) { performRandomMoves = false; }
    var overshootSpread = 10;
    var overshootRadius = 120;
    var previous = start;
    var moving = false;
    var tracePath = function (vectors, abortOnMove) {
        if (abortOnMove === void 0) { abortOnMove = false; }
        return __awaiter(void 0, void 0, void 0, function () {
            var vectors_1, vectors_1_1, v, error_1, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, 9, 10]);
                        vectors_1 = __values(vectors), vectors_1_1 = vectors_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!vectors_1_1.done) return [3, 7];
                        v = vectors_1_1.value;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        if (abortOnMove && moving) {
                            return [2];
                        }
                        return [4, delay(Math.random() * 25)];
                    case 3:
                        _b.sent();
                        return [4, page.mouse.move(v.x, v.y)];
                    case 4:
                        _b.sent();
                        previous = v;
                        return [3, 6];
                    case 5:
                        error_1 = _b.sent();
                        if (!page.browser().isConnected())
                            return [2];
                        console.debug('Warning: could not move mouse, error message:', error_1);
                        return [3, 6];
                    case 6:
                        vectors_1_1 = vectors_1.next();
                        return [3, 1];
                    case 7: return [3, 10];
                    case 8:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3, 10];
                    case 9:
                        try {
                            if (vectors_1_1 && !vectors_1_1.done && (_a = vectors_1.return)) _a.call(vectors_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7];
                    case 10: return [2];
                }
            });
        });
    };
    var randomMove = function () { return __awaiter(void 0, void 0, void 0, function () {
        var rand, _2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!!moving) return [3, 3];
                    return [4, exports.getRandomPagePoint(page)];
                case 1:
                    rand = _a.sent();
                    return [4, tracePath(path(previous, rand), true)];
                case 2:
                    _a.sent();
                    previous = rand;
                    _a.label = 3;
                case 3: return [4, delay(Math.random() * 2000)];
                case 4:
                    _a.sent();
                    randomMove().then(function (_) { }, function (_) { });
                    return [3, 6];
                case 5:
                    _2 = _a.sent();
                    console.debug('Warning: stopping random mouse movements');
                    return [3, 6];
                case 6: return [2];
            }
        });
    }); };
    var actions = {
        toggleRandomMove: function (random) {
            moving = !random;
        },
        click: function (selector, options) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions.toggleRandomMove(false);
                            if (!(selector !== undefined)) return [3, 2];
                            return [4, actions.move(selector, options)];
                        case 1:
                            _a.sent();
                            actions.toggleRandomMove(false);
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 7, , 8]);
                            return [4, page.mouse.down()];
                        case 3:
                            _a.sent();
                            if (!((options === null || options === void 0 ? void 0 : options.waitForClick) !== undefined)) return [3, 5];
                            return [4, delay(options.waitForClick)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [4, page.mouse.up()];
                        case 6:
                            _a.sent();
                            return [3, 8];
                        case 7:
                            error_2 = _a.sent();
                            console.debug('Warning: could not click mouse, error message:', error_2);
                            return [3, 8];
                        case 8: return [4, delay(Math.random() * 2000)];
                        case 9:
                            _a.sent();
                            actions.toggleRandomMove(true);
                            return [2];
                    }
                });
            });
        },
        move: function (selector, options) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var elem, frame, contentIframe, contentFrame, _3, box, height, width, destination, dimensions, overshooting, to, correction;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            actions.toggleRandomMove(false);
                            elem = null;
                            if (!(typeof selector === 'string')) return [3, 9];
                            frame = page;
                            if (!options.iframe) return [3, 5];
                            if (!options.waitForIframe) return [3, 2];
                            return [4, page.waitForSelector(options.iframe)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [4, page.$(options.iframe)];
                        case 3:
                            contentIframe = _b.sent();
                            return [4, (contentIframe === null || contentIframe === void 0 ? void 0 : contentIframe.contentFrame())];
                        case 4:
                            contentFrame = _b.sent();
                            frame = contentFrame;
                            _b.label = 5;
                        case 5:
                            if (!options.waitForSelector) return [3, 7];
                            return [4, frame.waitForSelector(selector)];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7: return [4, frame.$(selector)];
                        case 8:
                            elem = _b.sent();
                            return [3, 10];
                        case 9:
                            elem = selector;
                            _b.label = 10;
                        case 10:
                            if (!(((_a = elem._remoteObject) === null || _a === void 0 ? void 0 : _a.objectId) !== undefined)) return [3, 15];
                            _b.label = 11;
                        case 11:
                            _b.trys.push([11, 13, , 15]);
                            return [4, page._client.send('DOM.scrollIntoViewIfNeeded', {
                                    objectId: elem._remoteObject.objectId
                                })];
                        case 12:
                            _b.sent();
                            return [3, 15];
                        case 13:
                            _3 = _b.sent();
                            return [4, elem.evaluate(function (e) { return e.scrollIntoView(); })];
                        case 14:
                            _b.sent();
                            return [3, 15];
                        case 15: return [4, getElementBox(page, elem, true)];
                        case 16:
                            box = _b.sent();
                            if (box === null) {
                                throw new Error("Could not find the dimensions of the element you're clicking on, this might be a bug?");
                            }
                            height = box.height, width = box.width;
                            destination = getRandomBoxPoint(box, options);
                            dimensions = { height: height, width: width };
                            overshooting = false;
                            to = overshooting ? math_1.overshoot(destination, overshootRadius) : destination;
                            return [4, tracePath(path(previous, to))];
                        case 17:
                            _b.sent();
                            if (!overshooting) return [3, 19];
                            correction = path(to, __assign(__assign({}, dimensions), destination), overshootSpread);
                            return [4, tracePath(correction)];
                        case 18:
                            _b.sent();
                            _b.label = 19;
                        case 19:
                            previous = destination;
                            actions.toggleRandomMove(true);
                            return [2];
                    }
                });
            });
        },
        moveTo: function (destination) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actions.toggleRandomMove(false);
                            return [4, tracePath(path(previous, destination))];
                        case 1:
                            _a.sent();
                            actions.toggleRandomMove(true);
                            return [2];
                    }
                });
            });
        }
    };
    if (performRandomMoves)
        randomMove().then(function (_) { }, function (_) { });
    return actions;
};
exports.createCursor = createCursor;
