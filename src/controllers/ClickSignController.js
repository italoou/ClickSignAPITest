const clickSignService = require('../services/ClickSignService')

class ClickSignController{

  async UploadDocument(req, res, next){
    // req.connection.setTimeout( 1000 * 60 * 10 );
    const response = await clickSignService.UploadDocument(req.file);
    // res.json(response);
    req.body.document_key = response;
    next();
  }
  async CreateDocument(req, res, next){
    const response = await clickSignService.CreateDocument(req.body.textocontrato);
    req.body.document_key = response;
    next()
  }
  async AddSigner(req, res, next){
    // console.log(req);
    // req.body.signer_key = process.env.KEYEMAILTOKEN;
    const retorno = await clickSignService.AddSigner(req.body.document_key, req.body.signer_key, 'src/assinador2.json');
    await clickSignService.SignDocumentAPI(req.body.api_request_signature_key);
    res.status(retorno.status).render('signer', {request_signature_key: retorno.list.request_signature_key});
  }

  async AddSignerAPI(req, res, next){
    // console.log(req);
    req.body.signer_keyAPI = process.env.KEYAPITOKEN;
    const retorno = await clickSignService.AddSignerAPI(req.body.document_key, req.body.signer_keyAPI);
    req.body.api_request_signature_key = retorno.list.request_signature_key
    next()
  }

  async SignDocumentAPI(req, res, next){
    await clickSignService.SignDocumentAPI(req.body.api_request_signature_key);
    next();
  }

  async CreateSigner(req, res, next){
    const retorno = await clickSignService.CreateSigner(req.body.email, req.body.cpf, req.body.dtNasc);
    // console.log(retorno);
    req.body.signer_key = retorno.signer.key;
    next();
  }

}

module.exports = new ClickSignController();