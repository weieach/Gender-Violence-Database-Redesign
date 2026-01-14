gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

document.addEventListener("DOMContentLoaded", (event) => {
  
  let smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    // smooth: 2
  });
});


gsap.utils.toArray(".div-screen").forEach((screen, i) => {
    ScrollTrigger.create({
        trigger: screen,
        start: "top top",
       anticipatePin: 1,
        pin: true,
        scrub: true,
    })
})
