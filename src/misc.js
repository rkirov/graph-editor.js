// Miscellaneous functions  

function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a));
}

function sort_num(a, b){
    return a - b;
}

// first element in array such that f(i) is true.
// If f(i) is always false returns undefined.
function first(array, f){
    var l = array.length;
    for(var i = 0; i < l; ++i) {
        if (f(array[i])) {
            return array[i];
        }
    }
}

function nonundef(x) {
    return x !== undefined;
}

// functional min.
function fmin(a, lessthan) {
    var i, l = a.length, best = 0;
    for(i = 0; i < l; i++) {
        if (lessthan(a[i], a[best])) {
            best = i;
        }
    }
    return a[best];
}

// Drawing functions
function circle(x, y, r, nofillFlag){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    if (!nofillFlag) ctx.fill();
    ctx.stroke();
}

function line(x1, y1, x2, y2) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();
}
