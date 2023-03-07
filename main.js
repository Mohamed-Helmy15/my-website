const typeWriter = (selector) => {
  const el = document.querySelector(selector);
  const text = el.innerHTML;
  (function _type(i = 0) {
    if (i === text.length) return;
    el.innerHTML =
      text.substring(0, i + 1) + '<span aria-hidden="true"></span>';
    setTimeout(() => _type(i + 1), 100);
  })();
};
typeWriter(".js-type-writer");

let scrollBtn = document.querySelector(".scroll");
let ourSkills = document.querySelector(".skills");
window.onscroll = function () {
  if (window.pageYOffset >= 400) {
    scrollBtn.classList.add("in");
  } else {
    scrollBtn.classList.remove("in");
  }

  if (
    window.scrollY >= ourSkills.offsetTop - 300 &&
    window.scrollY <= ourSkills.offsetTop + 300
  ) {
    document
      .querySelectorAll(".skills .skills-content span")
      .forEach((span) => {
        span.style.width = span.dataset.progress;
      });
  } else {
    document
      .querySelectorAll(".skills .skills-content span")
      .forEach((span) => {
        span.style.width = 0;
      });
  }
};
