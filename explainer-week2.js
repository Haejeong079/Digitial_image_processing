function sw(btn, id) {
  document.querySelectorAll('.tab2').forEach(function (t) { t.classList.remove('on'); });
  document.querySelectorAll('.tsec').forEach(function (t) { t.classList.remove('on'); });
  btn.classList.add('on');
  document.getElementById(id).classList.add('on');
}

var vals = [10, 20, 30, 40, 50];

function hl(i) {
  document.querySelectorAll('#list-display .list-cell').forEach(function (c, j) {
    c.classList.toggle('highlight', j === i);
  });
  document.getElementById('hl-result').textContent = 'a[' + i + '] = ' + vals[i];
}

function sliceUpdate() {
  var s = parseInt(document.getElementById('sl-s').value);
  var e = parseInt(document.getElementById('sl-e').value);
  document.getElementById('sl-sv').textContent = s;
  document.getElementById('sl-ev').textContent = e;
  for (var i = 0; i < 5; i++) {
    var c = document.getElementById('sc' + i);
    c.classList.toggle('highlight', i >= s && i < e);
  }
  var picked = vals.slice(s, e);
  document.getElementById('slice-result').textContent = 'a[' + s + ':' + e + '] = [' + picked.join(', ') + ']';
}

document.getElementById('sl-s').addEventListener('input', sliceUpdate);
document.getElementById('sl-e').addEventListener('input', sliceUpdate);

sliceUpdate();
