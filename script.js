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
