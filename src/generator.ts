export default function* counter(): Generator<number, string, boolean> {
   let i = 0;
   while (true) {
      if (yield i++) {
         break;
      }
   }
   return "done!";
}