"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const generator_1 = __importDefault(require("./generator"));
shelljs_1.config.verbose = true;
let present = shelljs_1.pwd();
console.log(present.stdout);
let list = shelljs_1.ls(`-A`);
console.log(list.grep('tsconfig').stdout);
let result = shelljs_1.grep(`-l`, /config/gi, "index*");
result.stdout.split('\n').forEach(file => {
    if (file) {
        let result = shelljs_1.grep(/config/gi, file);
        console.log(result.stdout);
    }
});
let division = 5 / 0;
let iter = generator_1.default();
let curr = iter.next();
while (!curr.done) {
    console.log(curr.value);
    curr = iter.next(curr.value === 5);
}
console.log(curr.value.toUpperCase());
//# sourceMappingURL=index.js.map