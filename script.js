document.addEventListener("DOMContentLoaded", function() {
    // Select elements
    const imagesContainer = document.querySelector(".carousel-images");
    const images = document.querySelectorAll(".carousel img");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    let index = 0;
    const totalImages = images.length;
    let autoSlideInterval;

    function updateCarousel() {
        imagesContainer.style.transform = `translateX(-${index * 200}%)`;
    }

    function nextImage() {
        index = (index + 1) % totalImages;
        updateCarousel();
        resetAutoSlide(); // Reset auto-slide timer when manually changing images
    }

    function prevImage() {
        index = (index - 1 + totalImages) % totalImages;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            nextImage();
        }, 3000); // Change images every 3 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval); // Stop current timer
        startAutoSlide(); // Restart timer
    }

    // Button event listeners
    nextBtn.addEventListener("click", nextImage);
    prevBtn.addEventListener("click", prevImage);

    // Start automatic sliding
    startAutoSlide();
});
