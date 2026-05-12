# @ferrite/api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

usage: 
```ts
const client = new FerriteClient({
  baseURL: 'https://api.ferrite.dev',
  version: 'v1',
  getToken: async () => 'token',
});

```
