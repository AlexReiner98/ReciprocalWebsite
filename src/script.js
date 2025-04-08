
let pageLoaded = false;
let animationLooped = false;

function tryRevealSite() {
  if (pageLoaded && animationLooped) {
    const loader = document.getElementById('loading-screen');
    loader.classList.add('hidden');
    setTimeout(() => loader.style.display = 'none', 1000);
    document.getElementById('site-content').style.display = 'block';
  }
}

// Lottie animation setup
const spinner = lottie.loadAnimation({
  container: document.getElementById('lottie-spinner'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'Images/logo-animation-white.json'
});

spinner.addEventListener('loopComplete', () => {
  animationLooped = true;
  tryRevealSite();
});

window.addEventListener('load', () => {
  pageLoaded = true;
  tryRevealSite();
});


document.addEventListener("DOMContentLoaded", function() {
    // Select elements
    const imagesContainer = document.querySelector(".carousel-images");
    const images = document.querySelectorAll(".carousel img");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    let index = 0;
    const totalImages = images.length;
    const testImage = images[0];
    let autoSlideInterval;

    function updateCarousel() {
        imagesContainer.style.transform = `translateX(-${index * (testImage.offsetWidth / imagesContainer.offsetWidth)*100}%)`;
    }

    function nextImage() {
        index = (index + 1) % totalImages;
        updateCarousel();
        resetAutoSlide(); 
    }

    function prevImage() {
        index = (index - 1 + totalImages) % totalImages;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            nextImage();
        }, 3000); 
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval); 
        startAutoSlide(); 
    }

    nextBtn.addEventListener("click", nextImage);
    prevBtn.addEventListener("click", prevImage);

    startAutoSlide();
});

document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("design-video");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // 50% of video must be visible
    });

    observer.observe(video);
});