let nh = [];
const nh_interface = function(s) {
  const cellSize = 8;
  const cells = 50;
  const center = Math.floor(cells/2);
  let nhSelection = 0;
  let grid;
  let draw = true;
  let cnv;
  s.setup = function() {
    cnv = s.createCanvas(cellSize*cells,cellSize*cells);
    cnv.parent('#nh_canvas');
    s.noStroke();
    const nhBtns = s.selectAll(".nh_btn");
    for (let j=0;j<nhBtns.length;j++) {nhBtns[j].removeClass("activebutton")}
    nhBtns[0].addClass("activebutton");
    for (let i=0;i<nhBtns.length;i++) {
      nh[i] = [];
      nhBtns[i].mousePressed(()=>{
        nhSelection=i;
        for (let j=0;j<nhBtns.length;j++) {nhBtns[j].removeClass("activebutton")}
        nhBtns[i].addClass("activebutton");
        s.displayCells();
      });
    }
    s.createGrid();
    s.displayCells();
    const nhDrawEraseBtn = s.select("#nh_drawerase");
    nhDrawEraseBtn.mouseClicked(()=>{
      draw = draw ? false : true;
      const dtext = draw ? "Borrador" : "Lápiz";
      nhDrawEraseBtn.html(dtext);
    });
  };

  s.createGrid = () => {
    grid = s.createGraphics(cellSize*cells,cellSize*cells);
    grid.clear();
    grid.stroke(200);
    grid.strokeWeight(0.5);
    for (let i=0;i<cells+1;i++) {
      grid.line(i*cellSize,0,i*cellSize,cellSize*cells);
      grid.line(0,i*cellSize,cellSize*cells,i*cellSize);
    }
  }

  s.displayCells = () => {
    s.background(255);
    s.fill('#0e71ba');
    s.rect(center*cellSize,center*cellSize,cellSize,cellSize);
    s.image(grid,0,0);
    for (let i=0;i<nh[nhSelection].length;i++) {
      s.fill('#c91f12');
      const coor = s.split(nh[nhSelection][i],",").map(d=>s.int(d));
      const x = (coor[0]+center)*cellSize;
      const y = (coor[1]+center)*cellSize;
      s.rect(x,y,cellSize,cellSize);
    }
  }

  s.mouseDragged = () => {register()}
  s.mousePressed = () => {register()}

  function register() {
    const tempw = cnv.elt.getBoundingClientRect().width;
    const temph = cnv.elt.getBoundingClientRect().height;
    if (s.mouseX>=0&&s.mouseX<=tempw&&s.mouseY>=0&&s.mouseY<=temph) {
      const coor = (Math.floor(s.mouseX/(tempw/cells))-center)+","+(Math.floor(s.mouseY/(temph/cells))-center);
      if (!nh[nhSelection].includes(coor) && draw) {
        nh[nhSelection].push(coor);
      } else if (nh[nhSelection].includes(coor) && !draw) {
        nh[nhSelection].splice(nh[nhSelection].indexOf(coor),1);
      }
      s.displayCells();
    }
  }
};
const nhcanvas = new p5(nh_interface);