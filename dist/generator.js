"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function* counter() {
    let i = 0;
    while (true) {
        if (yield i++) {
            break;
        }
    }
    return "done!";
}
exports.default = counter;
//# sourceMappingURL=generator.js.map