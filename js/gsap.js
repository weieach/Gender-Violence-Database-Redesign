gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

document.addEventListener("DOMContentLoaded", (event) => {
  
  let smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    // smooth: 2
  });




});

// snap to screen on scroll
// gsap.utils.toArray(".div-screen").forEach((screen, i) => {
//     ScrollTrigger.create({
//         trigger: screen,
//         start: "top top",
//        anticipatePin: 1,
//         pin: true,
//         scrub: true,
//     })
// })


let msgCaretDown = document.querySelectorAll(".msg-scrolldown .ph-caret-down");
gsap.to(msgCaretDown, {
  yPercent: 20,
  duration: 1,
  ease: "power2.in",
  repeat: -1,
  yoyo: true,
  // repeatDelay: 1.5 
});

let divMsgCaretDown = document.querySelector(".msg-scrolldown");
// let target = anchorMsgCaretDown.getAttribute("href"); 



divMsgCaretDown.addEventListener("click", (e) => {
  e.preventDefault();
  smoother.scrollTo("#second-screen", true, "top center")
//   gsap.to(smoother, {
//     scrollTop: smoother.offset("#second-screen", "center center"),
//     duration: 2, 
//     ease: 'back.out'
// })
    // smoother.scrollTo(target, true, "bottom 90px");
});