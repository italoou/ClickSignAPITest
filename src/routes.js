const router = require('express').Router();
const axios = require('axios');
const fs = require('fs');
const { createHmac } = require('node:crypto');

// const { Sequelize, DataTypes } = require('sequelize');


router.get('/', async (req, res) => {
  let text;
  await axios.get(`https://sandbox.clicksign.com/api/v1/accounts?access_token=${process.env.APIKEY}`)
  .then( (res) => {
    text = res.data;
  })
  .catch((error) => { console.log(error)});
  console.log(text);
  
  return res.status(200).render('home' ,{nameApp: "ClickSignApiTest",
                               APITest: JSON.stringify(text)});
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

  // const sequelize = new Sequelize({
  //   dialect: 'sqlite',
  //   storage: 'Database.db'
  // });
  // const Contrato = sequelize.define('Contrato', {
  //   // Model attributes are defined here
  //   id: {
  //     type: DataTypes.STRING,
  //     allowNull: false,
  //     primaryKey: true
  //   },
  //   texto: {
  //     type: DataTypes.STRING
  //     // allowNull defaults to true
  //   },
  //   assinado: {
  //     type: DataTypes.BOOLEAN
  //   }
  // }, {
  //   // Other model options go here
  // });

  let retorno;
  let header;
  let status;
  let id = 0;
  await axios.post(`https://sandbox.clicksign.com/api/v1/templates/889bbee7-b2d7-4270-b0b4-31b1f7c4cf5c/documents?access_token=${process.env.APIKEY}`, req.body)
  .then((res) => {
    retorno = res.data;
    status = res.status;
    header = res.header;
    id = res.data.document.key;
  })
  .catch((error) => {
    console.log(error);
    return res.status(error.response.status).send(error.response.data)
  });

  const obj = {id, texto: req.body.document.template.data.Texto, assinado: false };
  // const cont = await Contrato.create({
  //   id: id,
  //   texto: req.body.document.template.data.Texto, 
  //   assinado: false
  // }).catch((error) => {
  //   console.log(error);
  // })
  
  const documento = await fs.writeFileSync('src/database.json', JSON.stringify(obj));

  return res.status(status).send(retorno);
})

router.post('/assinar', async (req, res) => {
  const documento = await fs.readFileSync('src/database.json', 'utf8');
  const signer = req.body.event.data.signer
  let doc = JSON.parse(documento);
  console.log(req.body);
  if(doc.id == req.body.document.key){
    doc.assinado = true;
    doc.signer = signer;
  }
  
  await fs.writeFile('src/database.json', JSON.stringify(doc), (err) => {
    if(err) throw err;
    console.log("arquivo salvo");
  });

  return res.status(200).send();
})

router.get('/banco', async (req, res) =>{
  const documento = await fs.readFileSync('src/database.json', 'utf8');
  let doc = JSON.parse(documento);
  return res.status(200).render('index', {contrato: doc});
})

router.post('/signer', async (req, res) =>{
  const documento = await fs.readFileSync('src/database.json', 'utf8');
  let doc = JSON.parse(documento);
  let url;
  let status;
  let retorno;
  await axios.post(`https://sandbox.clicksign.com/api/v1/lists?access_token=${process.env.APIKEY}`, req.body)
  .then((res) => {
    url = res.data.list.url;
    retorno = res.data;
    status = res.status;
  })
  .catch((error) => {
    console.log(error);
    // throw error;
    return res.status(error.response.status).send(error.response.data)
  });
  doc.url = url;
  await fs.writeFile('src/database.json', JSON.stringify(doc), (err) => {
    if(err) throw err;
    console.log("arquivo salvo");
  });

  return res.status(status).send(retorno);
})

router.post('/api/assinar', async (req, res) => {

  let hash;

  const hmac = createHmac('sha256', process.env.SECRET);
  console.log("teste 1")
  
  hmac.update(req.body.request_signature_key); 

  hash = hmac.digest('hex')


  const obj = {
    request_signature_key: req.body.request_signature_key, secret_hmac_sha256: hash
  }

  console.log(hash);

  let retorno;
  let status = 500;
  await axios.post(`https://sandbox.clicksign.com/api/v1/sign?access_token=${process.env.APIKEY}`, obj)
  .then((res)=>{
    retorno = res.data;
    status = res.status;
  })
  .catch((error) => {
    console.log(error)
    return res.status(error.response.status).send(error);
  })

  return res.status(status).send(retorno);
})

module.exports = router