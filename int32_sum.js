function asmModule(stdlib, foreign, buffer) {
  "use asm";

  var int32x4 = stdlib.SIMD.int32x4
  var int32x4_splat = int32x4.splat;
  var int32x4_load = int32x4.load;
  var int32x4_add = int32x4.add;
  var fround = stdlib.Math.fround;
  var HEAPU8 = new stdlib.Uint8Array(buffer);
  var HEAP32 = new stdlib.Int32Array(buffer);

  function sum(length) {
    length = length|0;
    var i = 0, p = 0, sum = 0;
    for (i = 0; (i|0) < (100000|0); i = (i+1)|0) {
      sum = 0;
      for (p = 0; (p|0) < (length|0); p = (p+1)|0) {
        sum = (sum + (HEAP32[(p<<2)>>2]|0))|0;
      }
    }
    return sum|0;
  }

  function simdSum(length) {
    length = length|0;
    var i = 0, p = 0, sum4 = int32x4(0, 0, 0, 0);
    for (i = 0; (i|0) < (100000|0); i = (i+1)|0) {
      sum4 = int32x4_splat(0);
      for (p = 0; (p|0) < (length|0); p = (p+4)|0) {
        sum4 = int32x4_add(sum4, int32x4_load(HEAPU8, p<<2));
      }
    }
    return ((sum4.x|0) + (sum4.y|0) + (sum4.z|0) + (sum4.w|0))|0;
  }
  return {sum: sum, simdSum: simdSum};
} 

var length = 10000;
var buffer = new ArrayBuffer(0x10000);
var HEAP32 = new Int32Array(buffer);

for (var i = 0; i < length; i++) {
  HEAP32[i] = 1;
}

var asm = asmModule(this, {}, buffer);

print('scalar starts...');
var start = Date.now();
var result = asm.sum(length);
print('result: ' + result);
var end = Date.now();
var duration = end-start;
print('duration: ' + duration);

print('\nsimd starts...');
var start1 = Date.now();
var result1 = asm.simdSum(length);
print('result: ' + result1);
var end1 = Date.now();
var duration1 = end1-start1;
print('duration: ' + duration1);
print('');
if (result === result1)
  print('checksum is equal.');
else
  print('checksum is NOT equal.');
print('speedup: ' + duration/duration1);
