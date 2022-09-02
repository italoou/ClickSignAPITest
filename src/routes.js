const router = require('express').Router();
const axios = require('axios');
const fs = require('fs');

router.get('/', async (req, res) => {
  let text;
  await axios.get(`https://sandbox.clicksign.com/api/v1/accounts?access_token=${process.env.APIKEY}`)
  .then( (res) => {
    text = res.data;
  })
  .catch((error) => { console.log(error)});
  console.log(text);
  
  return res.status(200).send({nameApp: "ClickSignApiTest",
                               APITest: text});
})

router.get('/modelos', async (req, res) => {
  let text;
  await axios.get(`https://sandbox.clicksign.com/api/v2/templates?access_token=${process.env.APIKEY}`)
  .then((res) => {
    text = res.data;
  })
  .catch((error) => {console.log(error)});

  return res.status(200).send(text);
})

router.post('/modelos', async (req, res) => {
  let retorno;
  let status;
  let id = 0;
  await axios.post(`https://sandbox.clicksign.com/api/v1/templates/889bbee7-b2d7-4270-b0b4-31b1f7c4cf5c/documents?access_token=${process.env.APIKEY}`, req.body)
  .then((res) => {
    retorno = res.data;
    status = res.status;
    id = res.data.document.key;
  })
  .catch((error) => {
    return res.status(error.response.status).send(error.response.data)
  });

  const obj = {id, texto: req.body.document.template.data.Texto, assinado: false };
  const documento = await fs.writeFileSync('src/database.json', JSON.stringify(obj));

  return res.status(status).send(retorno);
})

router.post('/assinar', async (req, res) => {
  let documento = "texto"; 
  await fs.readFile('src/database.json', 'utf8', (err, data) =>{
    if(err){
      throw err;
    }
    documento = data;
    console.log("dados obtidos");
  });
  const signer = req.body.event.data.signer
  let doc = JSON.parse(documento);
  doc.assinado = true;
  doc.signer = signer;
  await fs.writeFile('src/database.json', JSON.stringify(doc), (err) => {
    if(err) throw err;
    console.log("arquivo salvo");
  });

  return res.status(200);
})

router.get('/banco', async (req, res) =>{
  const documento = await fs.readFileSync('src/database.json', 'utf8');
  let doc = JSON.parse(documento);
  return res.status(200).send(doc);
})

module.exports = router