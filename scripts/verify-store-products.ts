import { inMemoryStoreProducts } from '../server';

console.log("Analyzing inMemoryStoreProducts...");
console.log("Type of inMemoryStoreProducts:", typeof inMemoryStoreProducts);
console.log("Length of inMemoryStoreProducts:", inMemoryStoreProducts?.length);

if (Array.isArray(inMemoryStoreProducts)) {
  inMemoryStoreProducts.forEach((it, idx) => {
    if (!it) {
      console.log(`Index ${idx} is null or undefined!`);
    } else {
      console.log(`Index ${idx}:`, {
        id: it.id,
        name: it.name,
        description: it.description,
        category: it.category
      });
      if (it.name === undefined) {
        console.log(`Index ${idx} is missing NAME!`);
      }
      if (it.description === undefined) {
        console.log(`Index ${idx} is missing DESCRIPTION!`);
      }
    }
  });
}
