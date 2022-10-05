const express = require('express');
const router = require('./routes');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, "uploads")
  },
  filename: (req, file, cb) =>{
    cb(null, file.originalname)
  }
})

app.use(cors());
app.use(multer({ storage: fileStorage}).single("contrato"))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname, '/public')))
// app.use(fileUpload({
// 	limits: { fileSize: 50 * 1024 * 1024 },
//   parseNested: true,
//   useTempFiles : true,
//     tempFileDir : '/tmp/'
// }));

app.use(router);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ClickSignApiTest Server is running on http://localhost:${PORT}`));
