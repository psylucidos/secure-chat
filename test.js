
const BigNumber = require('big-number'); // get important module that allows really big number calculations

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

function findPrimitiveRoot(k) { // finds primitive root modulo
  var p = 2*k + 1;

  while(true) {

    x = ranBetween(1, 1000);

    if(x %p != 1 &&
       x**2 != 1 &&
       x**k != 1)  { return x; }
  }
}

var sharedPrime = 9811; // a shared prime number for key exchange
var sharedBase = findPrimitiveRoot(sharedPrime); // a primitive root modulo of shared prime (REALLY IMPORTANT) (idk why tho)

var aliceSecret = 2431; // secret number of alice
var bobSecret = 3443; // secret number of bob

console.log("------------------------");

console.log( "Publicly Shared Variables:") // display all the variables for ease of use
console.log( "    Publicly Shared Prime: " , sharedPrime )
console.log( "    Publicly Shared Base:  " , sharedBase )
console.log( "Private Variables:")
console.log( "    Alice Secret:  " , aliceSecret )
console.log( "    Bob Secret:  " , bobSecret )

// Alice Sends Bob A = g^a mod p
var A = new BigNumber(sharedBase).pow(aliceSecret).mod(sharedPrime);
console.log( "\n  Alice Sends Over Public Chanel: " , A.clean() )

// Bob Sends Alice B = g^b mod p
var B = new BigNumber(sharedBase).pow(bobSecret).mod(sharedPrime);
console.log( "  Bob Sends Over Public Chanel: ", B.clean() )

console.log( "\n------------\n" )
console.log( "Privately Calculated Shared Secret:" )
var aliceSharedSecret = B.pow(aliceSecret).mod(sharedPrime); // Alice Computes Shared Secret: s = B^a mod p
console.log( "    Alice Shared Secret: ", aliceSharedSecret.clean() )

var bobSharedSecret = A.pow(bobSecret).mod(sharedPrime); // Bob Computes Shared Secret: s = A^b mod p
console.log( "    Bob Shared Secret: ", bobSharedSecret.clean() )
