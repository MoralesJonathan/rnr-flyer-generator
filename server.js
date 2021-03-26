require('dotenv').config();
const server = require('express')(),
  port = process.env.PORT || 8080,
  environment = server.get('env'),
  logger = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  multer  = require('multer'),
  multerStorage = multer.memoryStorage(),
  photoUpload = multer({ storage: multerStorage }),
  { createCanvas, Image } = require('canvas');

environment == 'development' ? server.use(logger('dev')) : server.use(logger('short'));

const generateImages = bgPhotoBuff => {
  const dateOpts = {month: 'long',day: 'numeric'};
  const dateString = new Date().toLocaleDateString('en-US', dateOpts);
  const portraitImagePromise = generatePortraitImage(dateString, bgPhotoBuff);
  const landscapeImagePromise = generateLandscapeImage(dateString, bgPhotoBuff);
  return Promise.all([portraitImagePromise, landscapeImagePromise]);
}

const generatePortraitImage = (date, bgPhotoBuff) => {
  return new Promise((resolve, reject) => {
    try{
    const canvas = createCanvas(1080, 1920);
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, 1080, 1920);
    createBackgroundImage(context, bgPhotoBuff);
    context.font = '30px sans serif';
    context.fillStyle = '#FFF';
    context.fillText(date, 50, 100)
    resolve(canvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const generateLandscapeImage = (date, bgPhotoBuff) => {
  return new Promise((resolve, reject) => {
    try{
    const canvas = createCanvas(828, 828);
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, 828, 828);
    createBackgroundImage(context, bgPhotoBuff);
    context.font = '30px sans serif';
    context.fillStyle = '#FFF';
    context.fillText(date, 50, 100)
    resolve(canvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const createBackgroundImage = (context, imageBuffer) => {
  const bg = new Image();
  bg.onload = () => context.drawImage(bg, 0, 0);
  bg.onerror = err => { throw err };
  bg.src = imageBuffer;
  return bg;
}

server
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true
  }))

  .get('/', function(req, res) {
    res.send('Hello world!');
  })

  .post('/', photoUpload.single('background'), async function(req, res) {
    const backgroundPhoto = req.file;
    const backgroundPhotoBuff = backgroundPhoto.buffer;
    const [portraitStream, landscapeStream] = await generateImages(backgroundPhotoBuff);
    portraitStream.pipe(fs.createWriteStream(path.join(__dirname, 'portrait.png')));
    landscapeStream.pipe(fs.createWriteStream(path.join(__dirname, 'landscape.png')));
    res.send('Done!');
  })

  .listen(port, () => {
    console.log(`Server is running on port ${port} and is running with a ${environment} environment.`);
  });
