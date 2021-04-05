import counter from './generator';

test('generator', () => {
   let iter = counter();
   let curr = iter.next();
   while (!curr.done) {
      console.log(curr.value);
      curr = iter.next(curr.value === 5);
   }
   expect(curr.value).toBe("done!");
});