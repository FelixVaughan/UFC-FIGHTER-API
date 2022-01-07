const express = require('express');
const fighterRoute = require('./Routes/fighter');
const app = express();
const port = Number(3000);

app.use('/fighter',fighterRoute);

app.get('/', (req, res) => {

})
app.listen(port, () => console.log(`Server listening on port ${port}!`))