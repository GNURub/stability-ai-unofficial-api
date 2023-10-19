# stability-ai-unofficial-api

To install dependencies:

```bash
npm install stability-ai-unofficial-api
```

To run:

```js
import { imageGenerator } from 'stability-ai-unofficial-api';

const response = await imageGenerator.genImage('< prompt >');

console.log(response);
```

This project was created using `bun init` in bun v1.0.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
