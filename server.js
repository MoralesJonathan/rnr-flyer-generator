require('dotenv').config();
const server = require('express')(),
  port = process.env.PORT || 8080,
  environment = server.get('env'),
  logger = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser');
  environment == 'development' ? server.use(logger('dev')) : server.use(logger('short')),
  { createCanvas, loadImage } = require('canvas');

const generateImages = () => {
    const portraitImagePromise = generatePortraitImage();
    const landscapeImagePromise = generateLandscapeImage();
    return Promise.all([portraitImagePromise,landscapeImagePromise]);

}

const generatePortraitImage = () => {
  return new Promise((resolve, reject) => {
    try{
    const portraitCanvas = createCanvas(1080, 1920);
    const portraitContext = portraitCanvas.getContext('2d');
    portraitContext.fillStyle = '#000';
    portraitContext.fillRect(0, 0, 1080, 1920);
    resolve(portraitCanvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const generateLandscapeImage = () => {
  return new Promise((resolve, reject) => {
    try{
    const landscapeCanvas = createCanvas(828, 828);
    const landscapeContext = landscapeCanvas.getContext('2d');
    landscapeContext.fillStyle = '#000';
    landscapeContext.fillRect(0, 0, 828, 828);
    resolve(landscapeCanvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}
server
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true
  }))

  .get('/', async function(req, res) {
    const [portraitStream, landscapeStream] = await generateImages();
    portraitStream.pipe(fs.createWriteStream(path.join(__dirname, 'portrait.png')));
    landscapeStream.pipe(fs.createWriteStream(path.join(__dirname, 'landscape.png')));
    res.send('Hello world!');
  })

  .listen(port, () => {
    console.log(`Server is running on port ${port} and is running with a ${environment} environment.`);
  });
