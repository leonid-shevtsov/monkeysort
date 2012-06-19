function qsort(array) {
  function qsortPart(low, high) {
    var i = low;
    var j = high;
    var x = array[Math.floor((low+high)/2)];
    console.log(x);
    do {
      while (array[i] < x) ++i;
      while (array[j] > x) --j;
      if (i<=j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i++;
        j--;
      }
    } while (i<=j);

    if (low < j) qsortPart(low, j);
    if (i < high) qsortPart(i, high);
  }

  qsortPart(0, array.length-1);
}

function nonRecursiveQsort(array) {
  var stack = [];

  var pushSort = function(low, high) {
    stack.push({low: low, high: high});
  };

  var iterate = function(low, high) {
    var i = low;
    var j = high;
    var x = array[Math.floor((low+high)/2)];
    do {
      while (array[i] < x) ++i;
      while (array[j] > x) --j;
      if (i<=j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i++;
        j--;
      }
    } while (i<=j);

    if (low < j) pushSort(low, j);
    if (i < high) pushSort(i, high);
  };

  pushSort(0, array.length-1);

  while (stack.length > 0) {
    var params = stack.pop();
    iterate(params.low, params.high);
  }
}

function nonBlockingQsort(array, successCallback) {
  var stack = [];

  var pushSort = function(low, high) {
    stack.push({low: low, high: high});
  };

  var asyncCompare = function(x,y, callback) {
    result = x>y ? 1 : (x<y ? -1 : 0);
    //console.log(x,y, result);
    callback.call(this, result);
  };

  var asyncSwap = function(i, j, callback) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    callback.call(this);
  };

  var callCount = 0;

  var iterate = function(params) {
    if (!params.nextStep) {
      params.i = params.low;
      params.j = params.high;
      params.x = array[Math.floor((params.low+params.high)/2)];
      params.nextStep = 'i';
    }
    //console.log([array[0], array[1], array[2], array[3]], params.low, params.high, params.i, params.j, params.x, params.nextStep);
    if (params.nextStep == 'i') {
      callCount++;
      asyncCompare(array[params.i], params.x, function(result) {
        if (result == -1) {
          params.i++;
        } else {
          params.nextStep = 'j';
        }
        iterate(params);
        callCount--;
      });
    } else if (params.nextStep == 'j') {
      callCount++;
      asyncCompare(array[params.j], params.x, function(result) {
        if (result == 1) {
          params.j--;
        } else {
          params.nextStep = 'swap';
        }
        iterate(params);
        callCount--;
      });
    } else if (params.nextStep == 'swap') {
      if (params.i <= params.j) {
        callCount++;
        asyncSwap(params.i, params.j, function () {
          params.i++;
          params.j--;
          params.nextStep = 'closeLoop';
          iterate(params);
          callCount--;
        });
      } else {
        params.nextStep = 'closeLoop';
        iterate(params);
      }
    } else if (params.nextStep == 'closeLoop') {
      if (params.i <= params.j) {
        params.nextStep = 'i';
        iterate(params);
      } else {
        if (params.low < params.j) {
          iterate({low: params.low, high: params.j});
        }
        if (params.i < params.high) {
          iterate({low: params.i, high: params.high});
        }
      }
    }
    if (callCount === 0) {
      successCallback.apply(this);
    }
  };

  iterate({low: 0, high: array.length-1});
}

function nonBlockingQsort2(array, successCallback) {
  var asyncCompare = function(x,y, callback) {
    result = x>y ? 1 : (x<y ? -1 : 0);
    //console.log(x,y, result);
    callback(result);
  };

  var asyncSwap = function(i, j, callback) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    callback();
  };

  var callCount = 0;

  var makeParams = function(low, high) {
    return {low: low, high: high, i: low, j: high, x: array[Math.floor((low+high)/2)]};
  };

  var openLoop = function(low, high) {
    callCount++;
    convergeI(makeParams(low, high));
  };

  var convergeI = function(params) {
    asyncCompare(array[params.i], params.x, function(result) {
      if (result == -1) {
        params.i++;
        convergeI(params);
      } else {
        convergeJ(params);
      }
    });
  };

  var convergeJ = function(params) {
    asyncCompare(array[params.j], params.x, function(result) {
      if (result == 1) {
        params.j--;
        convergeJ(params);
      } else {
        performSwap(params);
      }
    });
  };

  var performSwap = function(params) {
    if (params.i <= params.j) {
      asyncSwap(params.i, params.j, function () {
        params.i++;
        params.j--;
        closeLoop(params);
      });
    } else {
      closeLoop(params);
    }
  };

  var closeLoop = function(params) {
    if (params.i <= params.j) {
      convergeI(params);
    } else {
      if (params.low < params.j) {
        openLoop(params.low, params.j);
      }
      if (params.i < params.high) {
        openLoop(params.i, params.high);
      }
      callCount--;
      if (callCount === 0) {
        successCallback();
      }
    }
  };

  openLoop(0, array.length-1);
}


function nonBlockingQsort3(array, successCallback) {
  var asyncRead = function(i, callback) {
    setTimeout(function() {
      callback(array[i]);
    }, Math.random()*1000);
  };

  var asyncWrite = function(i, v, callback) {
    array[i] = v;
    setTimeout(callback, Math.random()*1000);
  };

  var asyncWriteDouble = function(i, j, ri, rj, callback) {
    var wi = false, wj = false;
    asyncWrite(i, rj, function() {
      wi = true;
      if (wj) callback();
    });
    asyncWrite(j, ri, function() {
      wj = true;
      if (wi) callback();
    });
  };

  var asyncSwap = function(i, j, callback) {
    var ri = false, rj = false;
    asyncRead(i, function(v) {
      ri = v;
      if (rj !== false) asyncWriteDouble(i, j, ri, rj, callback);
    });
    asyncRead(j, function(v) {
      rj = v;
      if (ri !== false) asyncWriteDouble(i, j, ri, rj, callback);
    });
  };

  var callCount = 0;

  var openLoop = function(low, high) {
    callCount++;
    asyncRead(Math.floor((low+high)/2), function (x) {
      convergeI({low: low, high: high, i: low, j: high, x: x});
    });
  };

  var convergeI = function(params) {
    asyncRead(params.i, function(result) {
      if (result < params.x) {
        params.i++;
        convergeI(params);
      } else {
        convergeJ(params);
      }
    });
  };

  var convergeJ = function(params) {
    asyncRead(params.j, function(result) {
      if (result > params.x) {
        params.j--;
        convergeJ(params);
      } else {
        performSwap(params);
      }
    });
  };

  var performSwap = function(params) {
    if (params.i <= params.j) {
      asyncSwap(params.i, params.j, function () {
        params.i++;
        params.j--;
        closeLoop(params);
      });
    } else {
      closeLoop(params);
    }
  };

  var closeLoop = function(params) {
    if (params.i <= params.j) {
      convergeI(params);
    } else {
      if (params.low < params.j) {
        openLoop(params.low, params.j);
      }
      if (params.i < params.high) {
        openLoop(params.i, params.high);
      }
      callCount--;
      if (callCount === 0) {
        successCallback();
      }
    }
  };

  openLoop(0, array.length-1);
}
