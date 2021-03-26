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
  const dateOpts = {month: 'long',day: 'numeric'};
  const dateString = new Date().toLocaleDateString('en-US', dateOpts);
  const portraitImagePromise = generatePortraitImage(dateString);
  const landscapeImagePromise = generateLandscapeImage(dateString);
  return Promise.all([portraitImagePromise, landscapeImagePromise]);
}

const generatePortraitImage = (date) => {
  return new Promise((resolve, reject) => {
    try{
    const portraitCanvas = createCanvas(1080, 1920);
    const portraitContext = portraitCanvas.getContext('2d');
    portraitContext.fillStyle = '#000';
    portraitContext.fillRect(0, 0, 1080, 1920);
    portraitContext.font = '30px sans serif';
    portraitContext.fillStyle = '#FFF';
    portraitContext.fillText(date, 50, 100)
    resolve(portraitCanvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const generateLandscapeImage = (date) => {
  return new Promise((resolve, reject) => {
    try{
    const landscapeCanvas = createCanvas(828, 828);
    const landscapeContext = landscapeCanvas.getContext('2d');
    landscapeContext.fillStyle = '#000';
    landscapeContext.fillRect(0, 0, 828, 828);
    landscapeContext.font = '30px sans serif';
    landscapeContext.fillStyle = '#FFF';
    landscapeContext.fillText(date, 50, 100)
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
