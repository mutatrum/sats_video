const chroma = require('chroma-js');

var color;
var startColor;
var endColor;
var colorIndex;

function Color() {
  startColor = chroma.random();
  endColor = chroma.random();
  color = startColor;
  colorIndex = 0;
}

Color.prototype.next = () => {
  colorIndex++;
  if (colorIndex > 25) {
    colorIndex = 0;
    startColor = endColor;
    endColor = chroma.random();
  }
  color = chroma.mix(startColor, endColor, colorIndex / 25, 'lab');
}

Color.prototype.background = () => {
  return color.num() ^ 0xFF000000;
}

Color.prototype.foreground = () => {
  var rgb = color.rgb();
  return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 149 ? 0xFF000000 : 0xFFFFFFFF;
};

module.exports = Color;