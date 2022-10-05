const clickSignService = require('../services/ClickSignService')

class ClickSignController{

  async UploadDocument(req, res, next){
    const response = await clickSignService.UploadDocument(req.file);
    // res.json(response);
    req.body.document_key = response;
    next();
  }
  async CreateDocument(req, res, next){

  }
  async AddSigner(document_key, signer_key){
    // console.log(req);
    const response = await clickSignService.AddSigner(document_key, signer_key);
    return response;
  }
  async SignDocument(req, res, next){

  }

  // async ideia(req, res, next){
  //   const document_key = await clickSignService.UploadDocument(req.file);
  //   await clickSignService.AddSigner(document_key, process.env.KEYAPITOKEN);
  //   const retorno = await clickSignService.AddSigner(document_key, process.env.KEYEMAILTOKEN);
  //   res.send(retorno);
  // }
}

module.exports = new ClickSignController();