const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 840;
canvas.width = 840;

/**
 * Config Settings
 */
let order;
let thickness;
let lineColor;
let randomColor = false;
let background;
let mouseX, mouseY;
let scale = 100;
let rotated = true;
let rotation = 0;


const cX = canvas.width/2;
const cY = canvas.height/2;

let koch1;
let koch2;
let koch3;

// background
ctx.fillStyle = "#474646";
ctx.fillRect(0, 0, canvas.width, canvas.height);

/**
 * Subtracts vector v1 from v2
 * @returns new vector
 */
function subVectors(v1, v2) {
    return [v2[0] - v1[0], v2[1] - v1[1]];
}

/**
 * Adds vectors v1 and v2
 * @returns new vector
 */
function addVectors(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

/**
 * @param v the vector being rotated
 * @param rads the angle in radians
 * @returns the rotated vector
 */
function rotateVector(v, rads) {
    const cos = Math.cos(rads);
    const sin = Math.sin(rads);
    
    return [
        v[0] * cos - v[1] * sin, 
        v[0] * sin + v[1] * cos
    ];
}



/**
 * Segment Object Class
 */
class Segment {

    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    /**
     * Segment between a and b will be converted into koch curve:
     * [[a, p1], [p1, p2], [p2, p3], [p3, b]]
     * @returns [] of 4 new segments created in the next koch step.
     */
    getKochCurve() {
        let curve = [];

        // dV is the difference vector between a and b
        const dV = subVectors(this.a, this.b);
        dV[0] /= 3;
        dV[1] /= 3;
        // rV is the rotated dV by 60° to get the equilateral triangle segment
        const rV = rotateVector(dV, -Math.PI/3);

        // Seg 1
        const p1 = addVectors(this.a, dV);
        curve[0] = new Segment(this.a, p1);

        // Seg 4
        const p3 = subVectors(dV, this.b);
        curve[3] = new Segment(p3, this.b);

        // Seg 2
        const p2 = addVectors(p1, rV);
        curve[1] = new Segment(p1, p2)

        // Seg 3
        curve[2] = new Segment(p2, p3);

        return curve;
    }

    // render the segment
    render(ctx) {
        if(randomColor) {
            let r = Math.floor(Math.random() * 256);
            let g = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);
            ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
        } else {
            ctx.strokeStyle = lineColor;
        }
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(this.a[0], this.a[1]);
        ctx.lineTo(this.b[0], this.b[1]);
        ctx.stroke();
        ctx.closePath();
    }
}




/**
 * Koch Object Class
 */
class Koch {

    constructor(a, b) {
        this.segments = [];
        this.a = a;
        this.b = b;   
    }

    // sets the amount of iterations to generate the curve
    generate() {
        this.segments = [];
        this.segments.push(new Segment(this.a, this.b));
        for (let i = 1; i < order; i++) {
            this.nextOrderKoch();
        }
    }

    // get koch curve for each segment
    nextOrderKoch() {
        let nextGen = [];
        for(let i = 0; i < this.segments.length; i++) {
            nextGen.push(this.segments[i].getKochCurve());
        }
        this.convertArray(nextGen);
    }

    // convert array of segment arrays, to one array of segments
    convertArray(array) {
        this.segments = [];
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                this.segments.push(array[i][j]);
            }
        }
    }

    // render all the segments
    render() {
        for(let i = 0; i < this.segments.length; i++) {
            this.segments[i].render(ctx);
        }
    }
}




/**
 * Setup
 */

function setup() {
    thickness = 2;
    order = 1;
    background = "#474646";
    lineColor = 'rgb(235, 235, 235)';
    const size = 300;
 
    const height = (Math.sqrt(3)/2) * size;

    // setup triangle coordinates
    const x1 = cX - size/2;
    const y1 = cY - height/2 + size/8;
    const x2 = cX + size/2;
    const y2 = cY - height/2 + size/8;
    const x3 = cX;
    const y3 = cY + height/2 + size/8

    ctx.fillStyle = background;

    // create new koch objects
    koch1 = new Koch([x1, y1], [x2, y2]);
    koch2 = new Koch([x2, y2], [x3, y3]);
    koch3 = new Koch([x3, y3], [x1, y1]);
    // generate koch curves
    koch1.generate();
    koch2.generate();
    koch3.generate();

    render();
}

/**
 * Render each koch object
 */
function render() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    if(rotated) {
        ctx.translate(cX, cY);
        ctx.rotate(rotation * (Math.PI/180));
        ctx.translate(-cX, -cY);
    }

    koch1.render();
    koch2.render();
    koch3.render();

    ctx.restore();
}


/**
 * 
 * Mouse Event Handlers
 */

/**
 * Event Listener to setup mouse x and y positions
 */
canvas.addEventListener('mousedown', (e) => {
    canvas.style.cursor = "grabbing";
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    canvas.style.cursor = "grab";
});
canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = "grab";
});

/**
 * Event listener to translate the canvas elements when dragging mouse
 */
canvas.addEventListener('mousemove', (e) => {
    if(e.buttons !== 1) return;
    ctx.save()
    ctx.translate(e.clientX - mouseX, e.clientY - mouseY);
    mouseX = e.clientX;
    mouseY = e.clientY;
    render();
})

/**
 * 
 * Control Event Handlers
 */

/**
 * Color Input Handlers
 */
const color_input = document.querySelector('#color-picker');
color_input.addEventListener('input', () => {
    lineColor = color_input.value;
    render();
});
const background_input = document.querySelector('#bg-picker');
background_input.addEventListener('input', () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    background = background_input.value;
    ctx.fillStyle = background;
    render();
});

/**
 * Toggle Random Color Button Handler
 */
const enable_random = document.querySelector('#toggle-random');
enable_random.addEventListener('click', () => {
    if (randomColor) {
        enable_random.textContent = 'Enable Random';
        enable_random.style.background = 'rgb(224, 143, 143)';
    } else {
        enable_random.textContent = 'Disable Random';
        enable_random.style.background = 'rgb(204, 103, 103)';
    }
    randomColor = !randomColor;
    render();
});

/**
 * Line Thickness Input Handler
 */
const thickness_input = document.querySelector('#linewidth-slider');
thickness_input.addEventListener('input', () => {
    thickness = thickness_input.value;
    render();
});

/**
 * Order Input Handler
 */
const order_input = document.querySelector('#order-slider');
order_input.addEventListener('input', () => {
    order = order_input.value;
    koch1.generate();
    koch2.generate();
    koch3.generate();
    render();
});

/**
 * Rotation Input Handler
 */
const rotation_input = document.querySelector('#rotation-slider');
rotation_input.addEventListener('input', () => {
    rotation = rotation_input.value*15;
    render();
});

/**
 * Scale Button Handlers
 */
const scale_in = document.querySelector('#zoom-in');
scale_in.addEventListener('click', () => {
    scaleAll(1.1);
    scale+=10;
    document.querySelector('#scale-text').textContent = `Scale: ${scale}%`;
});
const scale_out = document.querySelector('#zoom-out');
scale_out.addEventListener('click', () => {
    if (scale < 20) return;
    scaleAll(0.9);
    scale-=10;
    document.querySelector('#scale-text').textContent = `Scale: ${scale}%`;
});

/**
 * Reset Button Handler
 */
const reset_btn = document.querySelector('#reset');
reset_btn.addEventListener('click', () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    thickness_input.value = thickness_input.defaultValue;
    document.querySelector('#linewidth_value').textContent = 'Stroke Width: 2';
    order_input.value = order_input.defaultValue;
    document.querySelector('#order_value').textContent = 'Order: 1';
    if(randomColor) enable_random.dispatchEvent(new Event('click'));
    color_input.value = color_input.defaultValue;
    background_input.value = background_input.defaultValue;
    rotation_input.value = rotation_input.defaultValue;
    rotation = 0;
    document.querySelector('#rotate_value').textContent = `Rotation: ${rotation}°`;
    scale = 100;
    document.querySelector('#scale-text').textContent = `Scale: ${scale}%`;
    setup();
});

/**
 * Scales canvas by a factor through the center
 * @param factor scale factor
 */
function scaleAll(factor) {
    ctx.translate(cX, cY);
    ctx.scale(factor, factor);
    ctx.translate(-cX, -cY);
    ctx.lineWidth = ctx.lineWidth / scale;
    render();
}


setup();
