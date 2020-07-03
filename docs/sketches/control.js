$ = (query) => document.querySelector(query);
Reveal.on( 'slidechanged', event => {
  console.log(event.currentSlide);
} );