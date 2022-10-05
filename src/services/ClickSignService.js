const pdf2base64 = require('pdf-to-base64');
const axios = require('axios');
const fs = require('fs');
const { json } = require('body-parser');

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

    // const documento = fs.readFileSync('database.json', 'utf8');
    // const doc = JSON.parse(documento);
    // doc.push({id});
    // fs.writeFileSync('database.json', JSON.stringify(doc), (err) => {
    //   if(err) throw err;
    //   console.log("arquivo salvo");
    // });
    // console.log(id);
    return id;
  }

  async AddSigner(document_key, signer_key){
    
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
      return res.status(error.response.status).send(error.response.data)
    });
   
    // const documento = fs.readFileSync('src/database.json', 'utf8');
    // const doc = JSON.parse(documento);
    // for(let i = 0; i < doc.length; i++){
    //   if(doc[i].id == document_key){
    //     doc[i].signer.push({signer_key, assinado: false})
    //   }
    // }
    // console.log(doc);
    // await fs.writeFileSync('src/database.json', JSON.stringify(doc), (err) => {
    //   if(err) throw err;
    //   console.log("arquivo salvo");
    // });

    retorno.status = status;
    return retorno;
  }

  
}

module.exports = new ClickSignService();