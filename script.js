document.addEventListener("DOMContentLoaded", function() {
    // Select elements
    const imagesContainer = document.querySelector(".carousel-images");
    const images = document.querySelectorAll(".carousel img");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const theCarousel = document.querySelector(".carousel");
    const image = document.querySelector("img");

    let index = 0;
    const totalImages = images.length;
    let autoSlideInterval;

    function updateCarousel() {
        imagesContainer.style.transform = `translateX(-${index * (image.offsetWidth / theCarousel.offsetWidth)*100}%)`;
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
