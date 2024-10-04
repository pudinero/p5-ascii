// Image to ASCII

// const density = "       ..::░░▒▒▓▓████";
// const density = "████▓▓▒▒░░::..     ";
// const density = "     ..::♥️♥️♣️♣️♠️♠️♦️♦️♦️♦️";
const density = "     ..::|/Xx&6#@";

let video;
let asciiDiv;
let containerDiv;
let cameraSelect;
let cameraSelected = 0;
let aspectRatio = 16 / 9;
let sourceText;
let sourceImg;
let startIndex = 0;
const devices = [];
let windowDimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let constraints;

function preload() {
  // sourceText = loadStrings("images/poem.txt");
  // sourceImg = loadImage("LRS-0809.jpg");
  cameraSelect = createSelect();

  containerDiv = createDiv();
  containerDiv.id("container");

  asciiDiv = createDiv();
  asciiDiv.id("ascii");

  heartDiv = createDiv();
  heartDiv.class("heart");

  containerDiv.child(asciiDiv);
  containerDiv.child(heartDiv);

  navigator.mediaDevices.enumerateDevices().then(gotDevices);
}

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == "videoinput") {
      console.info(deviceInfo.label, deviceInfo);
      devices.push(deviceInfo);
      cameraSelect.option(deviceInfo.label, deviceInfo.deviceId);
    }
  }
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.info("supportedConstraints", supportedConstraints);
  cameraSelect.changed((option) => {
    changeCamera(option.target.selectedIndex);
  });

  constraints = {
    video: {
      deviceId: {
        exact: devices[cameraSelected].deviceId,
      },
      aspectRatio: aspectRatio,
    },
  };

  video = createCapture(constraints);
}

function changeCamera(camera) {
  cameraSelected = camera;
  console.info(devices[cameraSelected].label, devices[cameraSelected]);

  constraints = {
    video: {
      deviceId: {
        exact: devices[cameraSelected].deviceId,
      },
      aspectRatio: aspectRatio,
    },
  };

  video.remove();
  video.stop();
  video = createCapture(constraints);
  setupCamera();
}

function setup() {
  noCanvas();
  setupCamera();
}

function setupCamera() {
  console.info("Window dimensions", windowDimensions);
  console.info("Video dimensions", {
    width: video.width,
    height: video.height,
  });

  const width = video.width; // 1920
  const height = video.height; // 1080
  const scale = 23;
  const total_pixels = width * height * (scale / 100);
  const w_ratio = height / width;
  const h_ratio = width / height;

  console.info("Ratio", `${w_ratio}/${h_ratio}`);
  console.info("Total pixels", total_pixels);

  const new_width = Math.sqrt(total_pixels / w_ratio);
  const new_height = Math.sqrt(total_pixels / h_ratio);

  console.info("Final resolution", { width: new_width, height: new_height });

  video.size(new_width, new_height);

  video.hide();
  video.volume(0);
}

function draw() {
  video.loadPixels();
  let asciiImage = "";
  for (let j = 0; j < video.height; j++) {
    for (let i = 0; i < video.width; i++) {
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, 0, len));
      const c = density.charAt(charIndex);
      if (c == " ") asciiImage += "&nbsp;";
      else asciiImage += c;
      // ? Renderizar con colores rompe todo porque es mucho texto
      // else asciiImage += "<span style=\"color: red\">" + c + "</span>";
    }
    asciiImage += "<br/>";
  }
  asciiDiv.html(asciiImage);
}

function valueToHex(c) {
  var hex = c.toString(16);
  return hex;
}

function rgbToHex(r, g, b) {
  return valueToHex(r) + valueToHex(g) + valueToHex(b);
}
