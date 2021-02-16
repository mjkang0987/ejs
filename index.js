const express = require('express');
const app = express();
const ejs = require('ejs');
const port = 3000;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, _ => {
  console.log(`
(\\_(\\       
(=' :') ~ ♡   
(,(')(')    
`);
})

