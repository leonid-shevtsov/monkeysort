$(function() {
  var matrix = {};
  var items = [];

  function recordComparison(a, b, value) {
    updateSingle(a, b, value);
    updateSingle(b, a, -value);
    console.log(matrix);
  }

  function updateSingle(a, b, value) {
    matrix[a][b] = value;
    updateTransitive(a, b);
  }

  function updateTransitive(a, b) {
    _.each(_.keys(matrix[b]), function(c) {
      if ((matrix[a][b] == matrix[b][c]) || (matrix[b][c] === 0)) {
        // TODO need more transitiveness here
        matrix[a][c] = matrix[a][b];
      }
    });
  }

  function initMatrix() {
    matrix = {};
    _.each(items, function(item) {
      matrix[item] = {};
      matrix[item][item] = 0;
    });
  }

  function quickSort() {
    var array = items;
    function qsortPart(low, high) {
      var i = low;
      var j = high;
      var x = array[Math.floor((low+high)/2)];
      do {
        while (true) {
          if (typeof(matrix[array[i]][x])=='undefined') {
            askUser(array[i], x);
            return false;
          } else if (matrix[array[i]][x] == -1) {
            ++i;
          } else break;
        }
        while (true) {
          if (typeof(matrix[x][array[j]])=='undefined') {
            askUser(x, array[j]);
            return false;
          } else if (matrix[x][array[j]] == -1) {
            --j;
          } else break;
        }
        if (i<=j) {
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
          i++;
          j--;
        }
      } while (i<=j);

      if (low < j) {
        if (!qsortPart(low, j)) return false;
      }
      if (i < high) {
        if (!qsortPart(i, high)) return false;
      }
      return true;
    }

    if (qsortPart(0, array.length-1)) {
      showResults();
    }
  }

  $('#submit').click(function(e) {
    e.preventDefault();
    items = _(_(_($('#items').val().split("\n")).map(function(s){return s.trim();})).reject(function(s){return s==="";})).uniq();
    
    initMatrix();
    quickSort();
  });

  function askUser(a, b) {
    $('#ask').show();
    $('#ask_a').text(a);
    $('#ask_b').text(b);
  }

  $('.ask_answer').click(function(e) {
    e.preventDefault();
    var a = $('#ask_a').text();
    var b = $('#ask_b').text();
    var result = Number($(this).data('result'));
    recordComparison(a,b,result);
    quickSort();
  });

  function showResults() {
    console.log(items);
  }
});

