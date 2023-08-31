// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
var imgIn;
var matrix = [
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
];
/////////////////////////////////////////////////////////////////
function preload() {
    imgIn = loadImage("assets/husky.jpg");
}
/////////////////////////////////////////////////////////////////
function setup() {
    createCanvas((imgIn.width * 2), imgIn.height);
}
/////////////////////////////////////////////////////////////////
function draw() {
    background(125);
    image(imgIn, 0, 0);
    image(earlyBirdFilter(imgIn), imgIn.width, 0);
    noLoop();
}
/////////////////////////////////////////////////////////////////
function mousePressed(){
  loop();
}
/////////////////////////////////////////////////////////////////
function earlyBirdFilter(img){
  var resultImg = createImage(imgIn.width, imgIn.height);
  resultImg = sepiaFilter(imgIn);
  resultImg = darkCorners(resultImg);
  resultImg = radialBlurFilter(resultImg);
  resultImg = borderFilter(resultImg)
  return resultImg;
}

function sepiaFilter(img) {
  img.loadPixels();
  var newImage = createImage(img.width, img.height);
  newImage.loadPixels();
  
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let index = (x + y * img.width) * 4;

      let oldRed = img.pixels[index];
      let oldGreen = img.pixels[index + 1];
      let oldBlue = img.pixels[index + 2];

      let newBlue = (oldRed * 0.272) + (oldGreen * 0.534) + (oldBlue * 0.131);
      let newGreen = (oldRed * 0.349) + (oldGreen * 0.686) + (oldBlue * 0.168);
      let newRed = (oldRed * 0.393) + (oldGreen * 0.769) + (oldBlue * 0.189);

      newImage.pixels[index] = newRed;
      newImage.pixels[index + 1] = newGreen;
      newImage.pixels[index + 2] = newBlue;
      newImage.pixels[index + 3] = img.pixels[index + 3]; // Keep alpha value
    }
  }

  newImage.updatePixels();
  return newImage;
}


function darkCorners(img) {
  img.loadPixels();
  let centerX = img.width / 2;
  let centerY = img.height / 2;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let pixelIndex = (x + y * img.width) * 4;

      let distance = dist(x, y, centerX, centerY);

      let dynLum = map(distance, 0, sqrt(centerX * centerX + centerY * centerY), 1, 0.4);
      dynLum = constrain(dynLum, 0.4, 1);

      img.pixels[pixelIndex] *= dynLum; // Red
      img.pixels[pixelIndex + 1] *= dynLum; // Green
      img.pixels[pixelIndex + 2] *= dynLum; // Blue
    }
  }
  img.updatePixels();
  return img;
}


function radialBlurFilter(img) {
  img.loadPixels();
  let centerX = mouseX;
  let centerY = mouseY;
  
  let kernelSize = 11; // Set the kernel size
  let kernel = createKernel(kernelSize); // Create the kernel

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let index = (x + y * img.width) * 4;

      let distance = dist(x, y, centerX, centerY);
      let dynBlur = map(distance, 100, 300, 0, 1);
      dynBlur = constrain(dynBlur, 0, 1);
      
      let c = convolution(x, y, img, kernel);
      
      img.pixels[index] = c[0] * dynBlur + img.pixels[index] * (1 - dynBlur); // Red channel
      img.pixels[index + 1] = c[1] * dynBlur + img.pixels[index + 1] * (1 - dynBlur); // Green channel
      img.pixels[index + 2] = c[2] * dynBlur + img.pixels[index + 2] * (1 - dynBlur); // Blue channel
    }
  }
  img.updatePixels();
  return img;
}

function createKernel(size) {
  let kernel = new Array(size);
  let kernelSum = 0;

  for (let i = 0; i < size; i++) {
    kernel[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      let distance = dist(i, j, floor(size / 2), floor(size / 2));
      let value = map(distance, 0, size / 2, 1, 0);
      kernelSum += value;
      kernel[i][j] = value;
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      kernel[i][j] /= kernelSum;
    }
  }

  return kernel;
}

function convolution(x, y, img, kernel) {
  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < kernel.length; i++) {
    for (let j = 0; j < kernel[i].length; j++) {
      let xOffset = i - floor(kernel.length / 2);
      let yOffset = j - floor(kernel[i].length / 2);
      let xIndex = x + xOffset;
      let yIndex = y + yOffset;

      xIndex = constrain(xIndex, 0, img.width - 1);
      yIndex = constrain(yIndex, 0, img.height - 1);

      let index = (xIndex + yIndex * img.width) * 4;

      r += img.pixels[index] * kernel[i][j];
      g += img.pixels[index + 1] * kernel[i][j];
      b += img.pixels[index + 2] * kernel[i][j];
    }
  }

  return [r, g, b];
}

function borderFilter(img) {
  let buffer = createGraphics(img.width, img.height);

  buffer.image(img, 0, 0);
  buffer.noFill();
  buffer.stroke(255);
  buffer.strokeWeight(20);
  buffer.rect(0, 0, buffer.width, buffer.height, 20);

  buffer.noStroke();
  buffer.rect(20, 20, buffer.width - 40, buffer.height - 40);

  return buffer;
}
