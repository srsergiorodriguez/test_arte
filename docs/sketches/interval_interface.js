$ = (query) => document.querySelector(query);

// GPU
const gpu = new GPU();

// Configuración del canvas
let cnv;
const canvasSize = 400;
let cellSize = 1;
let cellNum = canvasSize/cellSize;
let loadState = "none";
let drawing = false;

// Configuración del vecindario
let network; // contiene el estado de todo el tablero
let density = 0.4; // densidad de puntos blancos y negros en la semilla

// Configuración del turno
let animate = false;
let epochinterval;

// Sliders
let intervalSlidersLife = [];
let intervalPLife = [];
let intervalSlidersDeath = [];
let intervalPDeath = [];

// Intervals
const intervalNum = 1; // numero de intervalos para cada vecindario
let intervalLife = [];
let intervalDeath = [];

let intnh; // vecindario convertido de la interfaz de vecindarios

function setup() {
  cnv = createCanvas(canvasSize,canvasSize);
  cnv.parent('#interval_canvas');
}

function startIntervalInterface() {
  select('#interval_cover').remove();
	select('#nh_cover').show();
	Reveal.next();
	intnh = parseNh(nh);
  network  = randomNetworkGpu(density);
  populateIntervals();
  displayCells();
  rightMenu();
  select('#seed').mouseClicked(()=>{network=randomNetworkGpu(density);displayCells()});
  select('#save_img').mouseClicked(()=>{saveCanvas("MiAutomata","png")});
  select('#epoch').mouseClicked(newEpoch);
  select('#animate').mouseClicked(function() {
    animate = !animate;
    if (animate) {this.html("...Parar");epochinterval = setInterval(newEpoch,100)} 
    else {this.html("Animar");clearInterval(epochinterval)}
  });
}

function populateIntervals() {
	for (let i=0;i<intnh.length;i++) {
		intervalLife[i] = [];
		intervalDeath[i] = [];
		for (let j=0;j<intervalNum;j++) {
			intervalLife[i][j] = [0,0];
			intervalDeath[i][j] = [0,0];
		}
	}
}

const randomNetworkGpu = gpu.createKernel(function(d) {
	// Crea un tablero con una configuración aleatoria
	let tempVal = 0;
	if (Math.random(1)<d){tempVal=1} else {tempVal=0}
	return tempVal;
}).setOutput([cellNum,cellNum]);

const clearNetworkGpu = gpu.createKernel(function() {
	return 0;
}).setOutput([cellNum,cellNum]);

function rightMenu() {
  // GUI sliders
  for (let ld=0;ld<2;ld++) {
    const type = ld==0 ? "life" : "death";
    const id = type=="life" ? "#life_sliders" : "#death_sliders";
    let interval = type=="life" ? intervalLife : intervalDeath;
    let p = type=="life" ? intervalPLife : intervalPDeath;
    let sliders = type=="life" ? intervalSlidersLife : intervalSlidersDeath;
    sliders = [];
    p = [];
    for (let i=0;i<intnh.length;i++) {
      const container = createDiv("").parent(id).class("interval_container");
      const nhlen = intnh[i].length;
      const start = type=="life" ? [Math.floor(nhlen/4)*1,Math.floor(nhlen/4)*2] : [Math.floor(nhlen/4)*2,Math.floor(nhlen/4)*3];
      const options = {start:start,step:1,connect:true,range:{'min':0,'max':nhlen},keyboardSupport:false,behaviour:"drag"}
      sliders[i] = createDiv("").parent(container).class("slider").elt;
      noUiSlider.create(sliders[i],options,true);
      p[i] = createSpan(sVal(sliders[i])[0]+"/"+sVal(sliders[i])[1]).parent(container);
      interval[i] = sVal(sliders[i]);
      sliders[i].noUiSlider.on('update', function(v) {
        p[i].html(sVal(sliders[i])[0]+"/"+sVal(sliders[i])[1]);
        interval[i] = sVal(sliders[i]);
      });
    }
  }
}

function displayCells() {
	// Muestra los recuadros en el canvas
	background(255);
	let d = pixelDensity();
	loadPixels();
	for (let x=0;x<cellNum;x++) {
		for (let y=0;y<cellNum;y++) {
			let index = 4 * (y*width+x);
			if (network[x][y] == 0) {
				pixels[index] = 255;
				pixels[index+1] = 255;
				pixels[index+2] = 255;
				pixels[index+3] = 255;
			} else if (network[x][y] == 1) {
				pixels[index] = 0;
				pixels[index+1] = 0;
				pixels[index+2] = 0;
				pixels[index+3] = 255;
			}
		}
	}
	updatePixels();
}

const neighborsAliveGpu_nh1 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Devuelve el numero de vecinos vivos para cada recuadro
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const neighborsAliveGpu_nh2 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Devuelve el numero de vecinos vivos para cada recuadro
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const neighborsAliveGpu_nh3 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Devuelve el numero de vecinos vivos para cada recuadro
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const applyRuleGpu = gpu.createKernel(function(n_,na_,inum_,il_,id_) {
	// Aplica las reglas de los intervalos
	let tempVal = n_[this.thread.y][this.thread.x];
	for (let i=0;i<inum_;i++) {
		if (il_[i][0]<=na_[this.thread.y][this.thread.x]
			&&na_[this.thread.y][this.thread.x]<=il_[i][1]) {
			tempVal = 1;
		}
		if (id_[i][0]<=na_[this.thread.y][this.thread.x]
			&&na_[this.thread.y][this.thread.x]<=id_[i][1]) {
			tempVal = 0;
		}
	}
	return tempVal;
}).setOutput([cellNum,cellNum]);

function newEpoch() {
	// Crea un turno nuevo basado en los vecindarios y los intervalos
  const neighbors1 = neighborsAliveGpu_nh1(intnh[0],intnh[0].length,network,cellNum);
  const nextNetwork = applyRuleGpu(network,neighbors1,intervalNum,intervalLife[0],intervalDeath[0]);
  network = nextNetwork;
  const neighbors2 = neighborsAliveGpu_nh2(intnh[1],intnh[1].length,network,cellNum);
  const nextNetwork2 = applyRuleGpu(network,neighbors2,intervalNum,intervalLife[1],intervalDeath[1]);
  network = nextNetwork2;
  const neighbors3 = neighborsAliveGpu_nh3(intnh[2],intnh[2].length,network,cellNum);
  const nextNetwork3 = applyRuleGpu(network,neighbors3,intervalNum,intervalLife[2],intervalDeath[2]);
  network = nextNetwork3;
  displayCells();
}


// HELPERS

function sVal(s) {
  // Devuelve los valores de los sliders
  const v = s.noUiSlider.get();
  return [parseInt(v[0]),parseInt(v[1])]
}

function parseNh(nh) {
  // Convierte el vecindario de strings a arrays
  if (emptyArrays(nh)) {return [[[0,-1],[-1,0],[1,0],[0,1],[0,0]],[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[0,-2],[-2,0],[2,0],[0,2],[0,0]],[[1,1],[-1,-1]]]}
  const newNh = nh.map(nlist=>{
    const temp = nlist.map(elt=>{
      const arr = elt.split(",")
      return [parseInt(arr[0]),parseInt(arr[1])]
    })
    return temp
  });
  return newNh
}

function emptyArrays(arr) {
  // revisa si la array de arrays está vacía
  let answ = false;
  for (let i=0;i<arr.length;i++) {
    if (arr[i].length<=0) {
      answ = true
    }
  }
  return answ
}