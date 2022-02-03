/* global BigNumber */

const MINSECRET = 1000;
const MAXSECRET = 10000;

BigNumber.prototype.clean = function clean() {
  let total = '';
  for (let i = 0; i < this.number.length; i += 1) {
    total += this.number[this.number.length - (i + 1)];
  }
  return total;
};

function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const secret = ranBetween(MINSECRET, MAXSECRET); // eslint-disable-line
