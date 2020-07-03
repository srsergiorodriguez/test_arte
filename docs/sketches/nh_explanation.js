const nh_explanation = function(s) {
    const div = 10;
    const w = 400;
    const size = w/div;
    const k = 3;
    s.setup = function() {  
      const cnv = s.createCanvas(w,size);
      cnv.parent("#nh_explanation");
      s.reset();
      cnv.mouseMoved(()=>{
        s.reset();
        const tempsize = cnv.elt.getBoundingClientRect().width/div;
        const x = s.floor((s.mouseX)/tempsize);
        for (let j=-1;j<k-1;j++) {
          const f = j===0?'#0e71ba':'#c91f12'; 
          s.fill(f);
          s.rect((x*size)+(j*size),0,size,size);
        }
      });
      cnv.mouseOut(()=>{
        s.reset();
      })
    }
  
    s.reset = ()=>{
      s.background(255);
      s.strokeWeight(3);
      s.fill(255);
      s.rect(0,0,s.width,s.height);
      for (let i=0;i<div+1;i++) {
        s.line(size*i,0,size*i,s.height);
      }
    }
  }
  
  const nhecpcanvas = new p5(nh_explanation);