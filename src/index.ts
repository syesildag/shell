import { config, grep, ls, pwd, ShellString } from 'shelljs';

import counter from './generator';
import sendEmail from './nodemailer';

config.verbose = true;

let present: ShellString = pwd();

console.log(present.stdout);

let list = ls(`-A`);

console.log(list.grep('tsconfig').stdout);

let result = grep(`-l`, /config/gi, "src/index*");

result.stdout.split('\n').forEach(file => {
   if (file) {
      let result = grep(/config/gi, file);
      console.log(result.stdout);
   }
});

let division = 5 / 0;

let iter = counter();
let curr = iter.next();
while (!curr.done) {
   console.log(curr.value);
   curr = iter.next(curr.value === 5);
}
console.log(curr.value.toUpperCase());

sendEmail().catch(console.error);