import counter from './generator';

test('generator', () => {
   let iter = counter();
   let curr = iter.next();
   while (!curr.done) {
      curr = iter.next(curr.value === 5);
   }
   expect(curr.value).toBe("done!");
});