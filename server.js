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
  { createCanvas, Image, loadImage } = require('canvas');

environment == 'development' ? server.use(logger('dev')) : server.use(logger('short'));

const generateImages = (bgPhotoBuff, lineup) => {
  const dateOpts = {month: 'long',day: 'numeric'};
  const date = new Date().toLocaleDateString('en-US', dateOpts);
  const dateString = date.toLowerCase().trim();
  const formattedDateString = formatDate(dateString);
  const portraitImagePromise = generatePortraitImage(formattedDateString, bgPhotoBuff, lineup);
  const landscapeImagePromise = generateLandscapeImage(formattedDateString, bgPhotoBuff, lineup);
  return Promise.all([portraitImagePromise, landscapeImagePromise]);
}

const generatePortraitImage = (date, bgPhotoBuff, lineup) => {
  return new Promise((resolve, reject) => {
    try{
    const canvas = createCanvas(1080, 1920);
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, 1080, 1920);
    createBackgroundImageScaled(context, bgPhotoBuff);
    setTemplate('portrait', context);
    context.font = '35px sans serif';
    context.fillStyle = '#FFF';
    context.fillText(date, 250, 833)
    setLineup(lineup, context, 700, 900);
    resolve(canvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const generateLandscapeImage = (date, bgPhotoBuff, lineup) => {
  return new Promise((resolve, reject) => {
    try{
    const canvas = createCanvas(828, 828);
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, 828, 828);
    createBackgroundImageScaled(context, bgPhotoBuff);
    setTemplate('landscape', context);
    context.font = '22px sans serif';
    context.fillStyle = '#FFF';
    context.fillText(date, 420, 150)
    setLineup(lineup, context, 350, 350);
    resolve(canvas.createPNGStream());
    } catch(e){
      console.log(e);
      reject(e);
    }
  })
}

const setLineup = (lineup, context, sectionHeight, startY) => {
  const x = context.canvas.width < 1000 ? 175: 200;
  const rows = lineup.split('\n');
  const fontSize = sectionHeight < 600? 30:40;
  context.font = `bold ${fontSize}px sans serif`;
  const lineSpace = (75/100) * fontSize;
  const lineHeight = fontSize + lineSpace;
  const lineupHeight = (lineHeight * rows.length) - lineSpace;
  const topPadding = (sectionHeight - lineupHeight) / 2;
  let y = startY + topPadding;
  for(let row of rows) {
    context.fillText(row, x, y);
    y += lineHeight;
  }
}

const setTemplate = async (size, context) => {
  try {
    const image = await loadImage(`templates/${size}.png`);
    context.drawImage(image, 0, 0);
  } catch(e){
    console.log(e);
  }
}
const createBackgroundImageScaled = (context, imageBuffer) => {
  // source: https://bit.ly/2Px8WQK
  const x = 0;
  const y = 0;
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;

  const img = new Image();
  img.src = imageBuffer;

  const imgWidth = img.width;
  const imgHeight = img.height;
  const r = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
  let newWidth = imgWidth * r;
  let newHeight = imgHeight * r;
  let cx = 1;
  let cy = 1;
  let cw = 1;
  let ch = 1;
  let ar = 1;

  // decide which gap to fill    
  if (newWidth < canvasWidth) {
    ar = canvasWidth / newWidth;   
  }                          
  if (Math.abs(ar - 1) < 1e-14 && newHeight < canvasHeight){
    ar = canvasHeight / newHeight;
  }
  newWidth *= ar;
  newHeight *= ar;

  // calc source rectangle
  cw = imgWidth / (newWidth / canvasWidth);
  ch = imgHeight / (newHeight / canvasHeight);

  cx = (imgWidth - cw);
  cy = (imgHeight - ch);

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > imgWidth) cw = imgWidth;
  if (ch > imgHeight) ch = imgHeight;

  context.drawImage(img, cx, cy, cw, ch, x, y, canvasWidth, canvasHeight);
}

const formatDate = dateStr => {
  const [month, dayStr] = dateStr.split(' ');
  const day = parseInt(dayStr);
  let formatted = `${month} ${day}`;
  if(day > 9 && day < 20){
    formatted += 'th';
  } else {
    switch(dayStr.slice(-1)) {
      case '1':
          formatted += 'st';
          break;
      case '2':
          formatted += 'nd';
          break;
      case '3':
          formatted += 'rd';
          break;
      default:
          formatted += 'th';
    }
  }
  return formatted;
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
    const { lineup } = req.body;
    const backgroundPhotoBuff = backgroundPhoto.buffer;
    const [portraitStream, landscapeStream] = await generateImages(backgroundPhotoBuff, lineup);
    portraitStream.pipe(fs.createWriteStream(path.join(__dirname, 'portrait.png')));
    landscapeStream.pipe(fs.createWriteStream(path.join(__dirname, 'landscape.png')));
    res.send('Done!');
  })

  .listen(port, () => {
    console.log(`Server is running on port ${port} and is running with a ${environment} environment.`);
  });
