var express = require('express');
const app = express();

app.use(express.static('./'));

app.listen(8080, () => {
  console.log('Server listening on 8080');
});
