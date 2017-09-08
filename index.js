var express = require('express');

const app = express();

app.use(express.static('./'));

app.get('/testing', (req, res) => {
  res.status(200).send({msg: 'hello'});
});

app.listen(8080, () => {
  console.log('Server listening on 8080');
});
