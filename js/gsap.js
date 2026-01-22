gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;

document.addEventListener("DOMContentLoaded", (event) => {
  
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    // smooth: 2
  });

  const aboutTitle = document.querySelector(".about-us-page h1");
  if (aboutTitle) {
    ScrollTrigger.create({
      trigger: aboutTitle,
      start: "top top+=160",
      endTrigger: ".about-us-page",
      end: "bottom 100px",
      anticipatePin: 1,
      pin: aboutTitle,
      // markers: true,
      pinSpacing: false
    });
  }

  const blogsTitle = document.querySelector(".blogs-page h1");
  if (blogsTitle) {
    ScrollTrigger.create({
      trigger: blogsTitle,
      start: "top top+=160",
      endTrigger: ".blogs-page",
      end: "bottom 100px",
      anticipatePin: 1,
      pin: blogsTitle,
      // markers: true,
      pinSpacing: false
    });
  }

  const msgCaretDown = document.querySelector(".msg-scrolldown .ph-caret-down");
  if (msgCaretDown) {
  gsap.to(msgCaretDown, {
      yPercent: 20,
      duration: 0.7,
      ease: "power2.in",
      repeat: -1,
      yoyo: true
    });
  }

  const divMsgCaretDown = document.querySelector(".msg-scrolldown");
  if (divMsgCaretDown) {
    divMsgCaretDown.addEventListener("click", (e) => {
      e.preventDefault();
      if (smoother) {
        gsap.to(smoother, {
          scrollTop: smoother.offset("#second-screen", "top top"),
          duration: 1,
          ease: "power2.out"
        });
      }
    });
  }

  if (window.location.hash && smoother) {
    const targetHash = window.location.hash;
    requestAnimationFrame(() => {
      setTimeout(() => {
        gsap.to(smoother, {
          scrollTop: smoother.offset(targetHash, "top top"),
    duration: 1,
          ease: "power2.out"
        });
      }, 0);
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    const isSamePage = url.pathname === window.location.pathname;
    const hasHash = url.hash && url.hash.length > 1;
    if (!isSamePage || !hasHash || !smoother) return;

    event.preventDefault();
    gsap.to(smoother, {
      scrollTop: smoother.offset(url.hash, "top top"),
      duration: 1,
      ease: "power2.out"
    });
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

