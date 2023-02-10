"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bezierCurve = exports.overshoot = exports.generateBezierAnchors = exports.randomVectorOnLine = exports.randomNumberRange = exports.setMagnitude = exports.unit = exports.magnitude = exports.perpendicular = exports.direction = exports.add = exports.mult = exports.div = exports.sub = exports.origin = void 0;
var bezier_js_1 = __importDefault(require("bezier-js"));
exports.origin = { x: 0, y: 0 };
var sub = function (a, b) { return ({ x: a.x - b.x, y: a.y - b.y }); };
exports.sub = sub;
var div = function (a, b) { return ({ x: a.x / b, y: a.y / b }); };
exports.div = div;
var mult = function (a, b) { return ({ x: a.x * b, y: a.y * b }); };
exports.mult = mult;
var add = function (a, b) { return ({ x: a.x + b.x, y: a.y + b.y }); };
exports.add = add;
var direction = function (a, b) { return exports.sub(b, a); };
exports.direction = direction;
var perpendicular = function (a) { return ({ x: a.y, y: -1 * a.x }); };
exports.perpendicular = perpendicular;
var magnitude = function (a) {
    return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
};
exports.magnitude = magnitude;
var unit = function (a) { return exports.div(a, exports.magnitude(a)); };
exports.unit = unit;
var setMagnitude = function (a, amount) {
    return exports.mult(exports.unit(a), amount);
};
exports.setMagnitude = setMagnitude;
var randomNumberRange = function (min, max) {
    return Math.random() * (max - min) + min;
};
exports.randomNumberRange = randomNumberRange;
var randomVectorOnLine = function (a, b) {
    var vec = exports.direction(a, b);
    var multiplier = Math.random();
    return exports.add(a, exports.mult(vec, multiplier));
};
exports.randomVectorOnLine = randomVectorOnLine;
var randomNormalLine = function (a, b, range) {
    var randMid = exports.randomVectorOnLine(a, b);
    var normalV = exports.setMagnitude(exports.perpendicular(exports.direction(a, randMid)), range);
    return [randMid, normalV];
};
var generateBezierAnchors = function (a, b, spread) {
    var side = Math.round(Math.random()) === 1 ? 1 : -1;
    var calc = function () {
        var _a = __read(randomNormalLine(a, b, spread), 2), randMid = _a[0], normalV = _a[1];
        var choice = exports.mult(normalV, side);
        return exports.randomVectorOnLine(randMid, exports.add(randMid, choice));
    };
    return [calc(), calc()].sort(function (a, b) { return a.x - b.x; });
};
exports.generateBezierAnchors = generateBezierAnchors;
var clamp = function (target, min, max) {
    return Math.min(max, Math.max(min, target));
};
var overshoot = function (coordinate, radius) {
    var a = Math.random() * 2 * Math.PI;
    var rad = radius * Math.sqrt(Math.random());
    var vector = { x: rad * Math.cos(a), y: rad * Math.sin(a) };
    return exports.add(coordinate, vector);
};
exports.overshoot = overshoot;
var bezierCurve = function (start, finish, overrideSpread) {
    var min = 2;
    var max = 200;
    var vec = exports.direction(start, finish);
    var length = exports.magnitude(vec);
    var spread = clamp(length, min, max);
    var anchors = exports.generateBezierAnchors(start, finish, overrideSpread !== null && overrideSpread !== void 0 ? overrideSpread : spread);
    return new (bezier_js_1.default.bind.apply(bezier_js_1.default, __spreadArray(__spreadArray([void 0, start], __read(anchors)), [finish])))();
};
exports.bezierCurve = bezierCurve;
