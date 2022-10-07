const pdf2base64 = require('pdf-to-base64');
const axios = require('axios');
const fs = require('fs');
const { createHmac } = require('node:crypto');

class ClickSignService{
  async UploadDocument(file){

    let obj = {
      document: {
        path: "/"+file.originalname,
        content_base64: "data:application/pdf;base64,"
      }
    };
    
    await pdf2base64(file.path)
    .then(
        (response) => {
            obj.document.content_base64 += response;    
          }
    )
    .catch(
        (error) => {
            console.log(error);
        }
    )

    let retorno;
    let status;
    // let header;
    let id;
    await axios.post(`https://sandbox.clicksign.com/api/v1/documents?access_token=${process.env.APIKEY}`, obj)
    .then((res) => {
      retorno = res.data;
      status = res.status;
      // header = res.header;
      id = res.data.document.key;
    })
    .catch((error) => {
      console.log(error);
      return res.status(error.response.status).send(error.response.data)
    });
    const documento = fs.readFileSync('src/database.json', 'utf8');
    const doc = JSON.parse(documento);
    doc.push({id, signers: []});
    fs.writeFileSync('src/database.json', JSON.stringify(doc), (err) => {
      if(err) throw err;
      console.log("arquivo salvo");
    });

    return id;
  }

  async AddSignerAPI(document_key, signer_key){
    let status;
    let retorno;
    let obj = {
      list: {
        document_key: document_key,
        signer_key: signer_key,
        sign_as: "sign",
        refusable: false,
        group: 0,
        message: "Prezado Ítalo,\nPor favor assine o documento.\n\nQualquer dúvida estou à disposição.\n\nAtenciosamente,\nLima ITalo"
      }
    }

    await axios.post(`https://sandbox.clicksign.com/api/v1/lists?access_token=${process.env.APIKEY}`, obj)
    .then((res) => {
      // request_signature_key = res.data.list.request_signature_key;
      retorno = res.data;
      status = res.status;
      // console.log(retorno);
    })
    .catch((error) => {
      console.log(error);
      // throw error;
    });
   
    // const documento = fs.readFileSync(filename, 'utf8');
    // const doc = JSON.parse(documento);
    // for(let i = 0; i < doc.length; i++){
      // if(doc[i].id == document_key){
        // doc[i].signer.push({signer_key, assinado: false})
      // }
    // }
    // console.log(doc);
    // fs.writeFile(filename, JSON.stringify(retorno), (err) => {
      // if(err) throw err;
      // console.log("arquivo salvo");
    // });

    retorno.status = status;
    return retorno;
  }
  async AddSigner(document_key, signer_key, filename){
    
    let status;
    let retorno;
    
    let obj = {
      list: {
        document_key: document_key,
        signer_key: signer_key,
        sign_as: "sign",
        refusable: false,
        group: 0,
        message: "Prezado Ítalo,\nPor favor assine o documento.\n\nQualquer dúvida estou à disposição.\n\nAtenciosamente,\nLima ITalo"
      }
    }

    await axios.post(`https://sandbox.clicksign.com/api/v1/lists?access_token=${process.env.APIKEY}`, obj)
    .then((res) => {
      // request_signature_key = res.data.list.request_signature_key;
      retorno = res.data;
      status = res.status;
      // console.log(retorno);
    })
    .catch((error) => {
      console.log(error);
      // throw error;
      return error.response.data;
    });
   
    // const documento = fs.readFileSync(filename, 'utf8');
    // const doc = JSON.parse(documento);
    // for(let i = 0; i < doc.length; i++){
      // if(doc[i].id == document_key){
        // doc[i].signer.push({signer_key, assinado: false})
      // }
    // }
    // console.log(doc);
    // fs.writeFile(filename, JSON.stringify(retorno), (err) => {
      // if(err) throw err;
      // console.log("arquivo salvo");
    // });

    retorno.status = status;
    return retorno;
  }

  async CreateDocument(textocontrato){

    const obj = {
      document: {
        path: "/contratoTextoTe.docx",
        template: {
          data: {
            Texto: textocontrato
          }
        }
      }
    }

    let retorno;
    let header;
    let status;
    let id = 0;
    await axios.post(`https://sandbox.clicksign.com/api/v1/templates/889bbee7-b2d7-4270-b0b4-31b1f7c4cf5c/documents?access_token=${process.env.APIKEY}`, obj)
    .then((res) => {
      // retorno = res.data;
      // status = res.status;
      // header = res.header;
      id = res.data.document.key;
      // console.log("aquiq");
    })
    .catch((error) => {
      console.log(error);
      return res.status(error.response.status).send(error.response.data)
    });

    // const obj = {id, texto: req.body.document.template.data.Texto, assinado: false };
    // const cont = await Contrato.create({
    //   id: id,
    //   texto: req.body.document.template.data.Texto, 
    //   assinado: false
    // }).catch((error) => {
    //   console.log(error);
    // })

    const documento = await fs.readFileSync('src/database.json', 'utf8');
    let doc = JSON.parse(documento);
    doc.push({id, signers: []});
    await fs.writeFile('src/database.json', JSON.stringify(doc), (err) => {
      if(err) throw err;
      console.log("arquivo salvo");
    });
    return id;
  }

  async SignDocumentAPI(request_signature_key){
    let hash;

    const hmac = createHmac('sha256', process.env.SECRET);

    hmac.update(request_signature_key); 

    hash = hmac.digest('hex')

    const obj = {
      request_signature_key: request_signature_key, secret_hmac_sha256: hash
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

    return retorno;
  }
  
}

module.exports = new ClickSignService();