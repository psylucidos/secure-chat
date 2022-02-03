const MINSECRET = 1000;
const MAXSECRET = 10000;

BigNumber.prototype.clean = function () { // used to make the value of BigNumber()'s more eye friendly
  var total = "";
  for (var i = 0; i < this.number.length; i++) {
    total += this.number[this.number.length-(i+1)]
  }
  return total;
};

function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const secret = ranBetween(MINSECRET, MAXSECRET);
