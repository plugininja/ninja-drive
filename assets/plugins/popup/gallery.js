class PNGallery {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || ".gallery";
        this.itemSelector = options.itemSelector || ".gallery-item";
        this.items = options.items || [];
        this.currentIndex = 0;
        this.overlay = null;
        this.isOpen = false;

        this._eventsAttached = false;

        // Autoplay
        this.autoplay = options.autoplay || false;
        this.autoplaySpeed = options.autoplaySpeed || 5000;
        this._autoplayInterval = null;

        // Swipe/Drag
        this._touchStartX = 0;
        this._touchEndX = 0;
        this._mouseStartX = 0;
        this._mouseEndX = 0;
        this._isDragging = false;
        this._swipeThreshold = 50;

        // Zoom
        this._isZoomed = false;
        this._zoomLevel = 1;
        this._maxZoom = 3;
        this._minZoom = 1;
        this._zoomStep = 0.5;
        this._panStart = { x: 0, y: 0 };
        this._isPanning = false;
        this._currentTransform = { x: 0, y: 0 };

        // Thumbnails
        this.showThumbnails = options.showThumbnails !== false;
        this.thumbnailSize = options.thumbnailSize || 80;

        // Lazy loading
        this.loadedImages = new Set();
        this.loadedThumbnails = new Set();
        this._visibleSlides = new Set(); // Track which slides are loaded

        this.openGallery = this.open.bind(this);

        this.init();
    }

    init() {
        if (!this.items || this.items.length === 0) this.collectItems();
        this.attachEventListeners();
    }

    updateItems(newItems) {
        this.items = newItems || [];
        this.attachEventListeners();
    }

    collectItems() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;

        const elements = container.querySelectorAll(this.itemSelector);
        this.items = Array.from(elements).map((el) => ({
            src: el.getAttribute("data-src") || el.src,
            alt: el.alt || "Gallery image",
            thumbnail: el.getAttribute("data-thumbnail") || el.src,
        }));
    }

    attachEventListeners() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;
        const elements = container.querySelectorAll(this.itemSelector);
        elements.forEach((el, i) => (el.onclick = () => this.open(i)));

        if (!this._eventsAttached) {
            document.addEventListener("keydown", (e) => this.handleKeyboard(e));
            this._eventsAttached = true;
        }
    }

    createOverlay() {
        const overlay = document.createElement("div");
        overlay.className = "pngallery pngallery-overlay";

        const content = document.createElement("div");
        content.className = "pngallery-content";

        // Toolbar
        const toolbar = document.createElement("div");
        toolbar.className = "pngallery-toolbar";

        const closeBtn = document.createElement("span");
        closeBtn.className = "pngallery-close";
        closeBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';
        closeBtn.onclick = () => this.close();

        const counter = document.createElement("span");
        counter.className = "pngallery-counter";
        counter.textContent = `${this.currentIndex + 1} / ${this.items.length}`;

        const playBtn = document.createElement("span");
        playBtn.className = "pngallery-play";
        playBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>';
        playBtn.onclick = () => this.toggleAutoplay(playBtn);

        // Zoom buttons (only for images)
        const zoomInBtn = document.createElement("span");
        zoomInBtn.className = "pngallery-zoom-in";
        zoomInBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Zm-40-60v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z"/></svg>';
        zoomInBtn.onclick = (e) => {
            e.stopPropagation();
            this.zoomIn();
        };

        const zoomOutBtn = document.createElement("span");
        zoomOutBtn.className = "pngallery-zoom-out";
        zoomOutBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400ZM280-540v-80h200v80H280Z"/></svg>';
        zoomOutBtn.onclick = (e) => {
            e.stopPropagation();
            this.zoomOut();
        };

        const resetZoomBtn = document.createElement("span");
        resetZoomBtn.className = "pngallery-reset-zoom";
        resetZoomBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80Z"/></svg>';
        resetZoomBtn.onclick = (e) => {
            e.stopPropagation();
            this.resetZoom();
        };

        const buttons = [
            closeBtn,
            counter,
            playBtn,
            zoomInBtn,
            zoomOutBtn,
            resetZoomBtn,
        ];

        const item = this.items[this.currentIndex];
        if (item?.download && item.downloadUrl) {
            const downloadButton = document.createElement("span");
            downloadButton.className = "pngallery-download";
            downloadButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>';
            downloadButton.onclick = () =>
                window.open(item.downloadUrl, "_blank", "noopener");
            buttons.push(downloadButton);
        }

        toolbar.append(...buttons);

        overlay.appendChild(toolbar);

        const sliderTrack = document.createElement("div");
        sliderTrack.className = "pngallery-slider-track";
        sliderTrack.style.display = "flex";
        sliderTrack.style.transition = "transform 0.5s ease";
        sliderTrack.style.cursor = "grab";

        // Create slides for all media types
        this.items.forEach((item, index) => {
            const slide = document.createElement("div");
            slide.className = "pngallery-slide";
            slide.style.minWidth = "100%";
            slide.style.flexShrink = "0";
            slide.style.position = "relative";
            slide.style.overflow = "hidden";
            slide.style.display = "flex";
            slide.style.alignItems = "center";
            slide.style.justifyContent = "center";

            // Determine media type and create appropriate content
            if (item.video) {
                // Video slide
                const videoContainer = document.createElement("div");
                videoContainer.className = "pngallery-video-container";
                videoContainer.style.width = "100%";
                videoContainer.style.height = "100%";
                videoContainer.style.display = "flex";
                videoContainer.style.alignItems = "center";
                videoContainer.style.justifyContent = "center";
                videoContainer.style.position = "relative";

                slide.appendChild(videoContainer);
            } else if (item.audio) {
                // Audio slide
                const audioContainer = document.createElement("div");
                audioContainer.className = "pngallery-audio-container";
                audioContainer.style.width = "100%";
                audioContainer.style.height = "100%";
                audioContainer.style.display = "flex";
                audioContainer.style.alignItems = "center";
                audioContainer.style.justifyContent = "center";
                audioContainer.style.position = "relative";
                audioContainer.style.padding = "20px";

                slide.appendChild(audioContainer);
            } else if (item.iframe) {
                // Document slide (PDF, etc.)
                const docContainer = document.createElement("div");
                docContainer.className = "pngallery-document-container";
                docContainer.style.width = "100%";
                docContainer.style.height = "100%";
                docContainer.style.display = "flex";
                docContainer.style.flexDirection = "column";
                docContainer.style.alignItems = "center";
                docContainer.style.justifyContent = "center";
                docContainer.style.position = "relative";
                docContainer.style.padding = "20px";

                slide.appendChild(docContainer);
            } else {
                // Image slide (default)
                const imgContainer = document.createElement("div");
                imgContainer.className = "pngallery-img-container";
                imgContainer.style.width = "100%";
                imgContainer.style.height = "100%";
                imgContainer.style.display = "flex";
                imgContainer.style.alignItems = "center";
                imgContainer.style.justifyContent = "center";
                imgContainer.style.cursor = "grab";
                imgContainer.style.position = "relative";
                if (item.download) {
                    const downloadBtn = document.createElement("a");
                    downloadBtn.className = "pngallery-download";
                    downloadBtn.href = item.downloadUrl;
                    downloadBtn.target = "_blank";
                    downloadBtn.textContent = "Download";
                    imgContainer.appendChild(downloadBtn);
                }

                slide.appendChild(imgContainer);
            }

            sliderTrack.appendChild(slide);
        });

        content.appendChild(sliderTrack);

        // Navigation arrows
        const prevBtn = document.createElement("span");
        prevBtn.className = "pngallery-btn pngallery-prev";
        prevBtn.textContent = "❮";
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            this.resetZoom();
            this.prevSlide();
        };

        const nextBtn = document.createElement("span");
        nextBtn.className = "pngallery-btn pngallery-next";
        nextBtn.textContent = "❯";
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            this.resetZoom();
            this.nextSlide();
        };

        content.append(prevBtn, nextBtn);
        overlay.appendChild(content);

        // Create thumbnails container
        if (this.showThumbnails && this.items.length > 1) {
            const thumbnailsContainer = this.createThumbnails();
            overlay.appendChild(thumbnailsContainer);
        }

        // Event listeners
        sliderTrack.addEventListener("touchstart", (e) =>
            this.handleTouchStart(e),
        );
        sliderTrack.addEventListener("touchmove", (e) =>
            this.handleTouchMove(e),
        );
        sliderTrack.addEventListener("touchend", (e) => this.handleTouchEnd(e));

        sliderTrack.addEventListener("mousedown", (e) =>
            this.handleMouseDown(e),
        );
        sliderTrack.addEventListener("mousemove", (e) =>
            this.handleMouseMove(e),
        );
        sliderTrack.addEventListener("mouseup", (e) => this.handleMouseUp(e));
        sliderTrack.addEventListener("mouseleave", (e) =>
            this.handleMouseUp(e),
        );

        // Prevent drag events on navigation buttons
        [
            prevBtn,
            nextBtn,
            closeBtn,
            playBtn,
            zoomInBtn,
            zoomOutBtn,
            resetZoomBtn,
        ].forEach((btn) => {
            btn.addEventListener("mousedown", (e) => e.stopPropagation());
            btn.addEventListener("touchstart", (e) => e.stopPropagation());
        });

        this.sliderTrack = sliderTrack;
        this.counterElement = counter;
        return overlay;
    }

    // Update getCurrentImage to handle different media types
    getCurrentImage() {
        const slides = this.sliderTrack.querySelectorAll(".pngallery-slide");
        if (slides[this.currentIndex]) {
            // Only return image elements for zoom functionality
            return slides[this.currentIndex].querySelector(".pngallery-img");
        }
        return null;
    }

    // Update resetZoom to be safe for non-image slides
    resetZoom() {
        const currentImg = this.getCurrentImage();
        if (!currentImg) return; // Only reset zoom if it's an image

        this._zoomLevel = this._minZoom;
        currentImg.style.transform = `scale(${this._zoomLevel})`;
        this._isZoomed = false;
        this._currentTransform = { x: 0, y: 0 };
        currentImg.style.cursor = "grab";
    }

    // Load image for a specific slide
    loadSlideContent(index) {
        if (this._visibleSlides.has(index)) return;
        const slide = this.sliderTrack.children[index];
        if (!slide) return;

        const item = this.items[index];
        if (!item) return;

        if (item.video) {
            const videoContainer = slide.querySelector(
                ".pngallery-video-container",
            );
            if (!videoContainer) return;

            videoContainer.innerHTML = "";

            const video = document.createElement("video");
            video.className = "pngallery-video";
            video.controls = true;
            video.preload = "metadata";
            video.style.maxWidth = "100%";
            video.style.maxHeight = "100%";
            video.style.objectFit = "contain";

            // Set video attributes
            if (item.poster) {
                video.poster = item.poster;
            }
            if (item.video.attributes.autoplay) {
                video.autoplay = true;
            }
            if (item.video.attributes.loop) {
                video.loop = true;
            }
            if (item.video.attributes.muted) {
                video.muted = true;
            }

            const sourceEl = document.createElement("source");
            sourceEl.src = item.video.source.src;
            video.appendChild(sourceEl);

            video.addEventListener("error", () => {
                loader.style.display = "none";
                loader.innerHTML =
                    '<div class="pngallery-error">Failed to load video</div>';
            });

            video.addEventListener("loadedmetadata", () => {
                this._visibleSlides.add(index);
            });
            video.addEventListener("click", (e) => e.stopPropagation());

            videoContainer.appendChild(video);
        } else if (item.audio) {
            const audioContainer = slide.querySelector(
                ".pngallery-audio-container",
            );
            if (!audioContainer) return;

            audioContainer.innerHTML = "";

            const audio = document.createElement("audio");
            audio.className = "pngallery-audio";
            audio.controls = true;
            audio.preload = "metadata";
            audio.style.width = "100%";
            audio.style.maxWidth = "600px";

            // Audio attributes
            if (item.audio.attributes?.autoplay) {
                audio.autoplay = true;
            }
            if (item.audio.attributes?.loop) {
                audio.loop = true;
            }
            if (item.audio.attributes?.muted) {
                audio.muted = true;
            }

            const sourceEl = document.createElement("source");
            sourceEl.src = item.audio.source.src;
            sourceEl.type = item.audio.source.type || "audio/mpeg";
            audio.appendChild(sourceEl);

            audio.addEventListener("error", () => {
                loader.style.display = "none";
                loader.innerHTML =
                    '<div class="pngallery-error">Failed to load audio</div>';
            });

            audio.addEventListener("loadedmetadata", () => {
                this._visibleSlides.add(index);
            });
            // Prevent gallery close on interaction
            audio.addEventListener("click", (e) => e.stopPropagation());

            // audioContainer.appendChild(loader);
            audioContainer.appendChild(audio);
        } else if (item.iframe) {
            const docContainer = slide.querySelector(
                ".pngallery-document-container",
            );
            if (!docContainer) return;

            docContainer.innerHTML = "";
            // Create loader for document
            const loader = document.createElement("div");
            loader.className = "pngallery-loader";
            loader.innerHTML = `
                <div class="pngallery-spinner"></div>
                <div class="pngallery-loading-text">Loading document...</div>
            `;

            // Generic iframe for documents
            const iframe = document.createElement("iframe");
            iframe.className = "pngallery-iframe";
            iframe.src = item.src;
            // iframe.style.aspectRatio = "16 / 9";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowfullscreen", "true");
            iframe.setAttribute("allow", "autoplay");
            iframe.setAttribute("rel", "noopener noreferrer");
            iframe.setAttribute(
                "referrerpolicy",
                "strict-origin-when-cross-origin",
            );
            iframe.setAttribute(
                "sandbox",
                "allow-same-origin allow-scripts allow-popups allow-forms allow-presentation",
            );

            iframe.addEventListener("load", () => {
                loader.style.display = "none";
                this._visibleSlides.add(index);
            });

            iframe.addEventListener("error", () => {
                loader.style.display = "none";
                loader.innerHTML =
                    '<div class="pngallery-error">Failed to load document</div>';
            });

            docContainer.appendChild(loader);
            docContainer.appendChild(iframe);
        } else {
            const imgContainer = slide.querySelector(
                ".pngallery-img-container",
            );
            if (!imgContainer) return;

            // Clear existing content
            imgContainer.innerHTML = "";

            // Create loader
            const loader = document.createElement("div");
            loader.className = "pngallery-loader";
            loader.innerHTML = `
            <div class="pngallery-spinner"></div>
            <div class="pngallery-loading-text">Loading...</div>
        `;

            const img = document.createElement("img");
            img.className = "pngallery-img";
            // img.setAttribute("loading", "lazy");
            img.classList.add("loading");

            img.onload = () => {
                img.classList.remove("loading");
                loader.style.display = "none";
                img.style.opacity = "1";
                this.loadedImages.add(item.src);
                this._visibleSlides.add(index);
            };

            img.onerror = () => {
                img.classList.remove("loading");
                loader.style.display = "none";
                loader.innerHTML =
                    '<div class="pngallery-error">Failed to load image</div>';
            };

            img.src = item.src;
            img.alt = item.alt || "Gallery image";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.objectFit = "contain";
            img.style.transition = "transform 0.3s ease, opacity 0.3s ease";
            img.style.cursor = "grab";
            img.style.opacity = "0";

            // Prevent image drag default behavior
            img.addEventListener("dragstart", (e) => e.preventDefault());
            img.addEventListener("click", (e) => e.stopPropagation());

            // Double click to zoom
            img.addEventListener("dblclick", (e) => {
                e.stopPropagation();
                if (this._isZoomed) {
                    this.resetZoom();
                } else {
                    this.zoomIn();
                }
            });

            // Wheel zoom
            img.addEventListener(
                "wheel",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.deltaY < 0) {
                        this.zoomIn(e.clientX, e.clientY);
                    } else {
                        this.zoomOut();
                    }
                },
                { passive: false },
            );

            // Panning events
            img.addEventListener("mousedown", (e) =>
                this.handlePanStart(e, img),
            );
            img.addEventListener("mousemove", (e) =>
                this.handlePanMove(e, img),
            );
            img.addEventListener("mouseup", () => this.handlePanEnd(img));
            img.addEventListener("mouseleave", () => this.handlePanEnd(img));

            // Touch events for panning
            img.addEventListener("touchstart", (e) =>
                this.handlePanStart(e, img),
            );
            img.addEventListener("touchmove", (e) =>
                this.handlePanMove(e, img),
            );
            img.addEventListener("touchend", () => this.handlePanEnd(img));

            imgContainer.appendChild(loader);
            imgContainer.appendChild(img);
        }
    }

    // Unload images that are not visible to save memory
    unloadDistantSlides(currentIndex) {
        const buffer = 2; // Keep current, previous, and next slides loaded
        this._visibleSlides.forEach((loadedIndex) => {
            if (Math.abs(loadedIndex - currentIndex) > buffer) {
                this.unloadSlide(loadedIndex);
            }
        });
    }

    unloadSlide(index) {
        const slide = this.sliderTrack.children[index];
        if (!slide) return;

        const imgContainer = slide.querySelector(".pngallery-img-container");
        if (imgContainer) {
            imgContainer.innerHTML = ""; // Clear the image
        }
        this._visibleSlides.delete(index);
    }

    createThumbnails() {
        const thumbnailsContainer = document.createElement("div");
        thumbnailsContainer.className = "pngallery-thumbnails";

        const thumbnailsTrack = document.createElement("div");
        thumbnailsTrack.className = "pngallery-thumbnails-track";

        this.items.forEach((item, index) => {
            const thumbnail = document.createElement("div");
            thumbnail.className = "pngallery-thumbnail";
            if (index === this.currentIndex) {
                thumbnail.classList.add("active");
            }

            const thumbnailImgContainer = document.createElement("div");
            thumbnailImgContainer.className =
                "pngallery-thumbnail-img-container";
            thumbnailImgContainer.style.position = "relative";
            thumbnailImgContainer.style.width = "100%";
            thumbnailImgContainer.style.height = "100%";

            const thumbnailLoader = document.createElement("div");
            thumbnailLoader.className = "pngallery-thumbnail-loader";
            thumbnailLoader.innerHTML = "<div class=\"pngallery-thumbnail-spinner\"></div>";

            const thumbnailImg = document.createElement("img");
            thumbnailImg.className = "pngallery-thumbnail-img";

            const thumbnailSrc = item.thumb || item.src;

            thumbnailImg.onload = () => {
                thumbnailLoader.style.display = "none";
                thumbnailImg.style.opacity = "1";
                this.loadedThumbnails.add(thumbnailSrc);
            };
            thumbnailImg.onerror = () => {
                thumbnailLoader.style.display = "none";
            };
            thumbnailImg.src = thumbnailSrc;

            thumbnailImg.alt = item.alt || `Thumbnail ${index + 1}`;
            thumbnailImg.style.width = "100%";
            thumbnailImg.style.height = "100%";
            thumbnailImg.style.objectFit = "cover";
            thumbnailImg.style.opacity = "0";
            thumbnailImg.style.transition = "opacity 0.3s ease";

            thumbnailImgContainer.appendChild(thumbnailLoader);
            thumbnailImgContainer.appendChild(thumbnailImg);
            thumbnail.appendChild(thumbnailImgContainer);

            thumbnail.addEventListener("click", () => {
                this.resetZoom();
                this.goToSlide(index);
                this.updateThumbnails();
            });

            thumbnailsTrack.appendChild(thumbnail);
        });

        thumbnailsContainer.appendChild(thumbnailsTrack);
        this.thumbnailsTrack = thumbnailsTrack;
        return thumbnailsContainer;
    }

    updateThumbnails() {
        if (!this.thumbnailsTrack) return;

        const thumbnails = this.thumbnailsTrack.querySelectorAll(
            ".pngallery-thumbnail",
        );
        thumbnails.forEach((thumb, index) => {
            if (index === this.currentIndex) {
                thumb.classList.add("active");
                thumb.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            } else {
                thumb.classList.remove("active");
            }
        });
    }

    open(index) {
        this.currentIndex = index;
        this.isOpen = true;

        if (this.overlay) this.overlay.remove();
        this.overlay = this.createOverlay();
        document.body.appendChild(this.overlay);

        setTimeout(() => this.overlay.classList.add("active"), 10);
        document.body.style.overflow = "hidden";

        this.goToSlide(this.currentIndex);

        if (this.autoplay) this.startAutoplay();
    }

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove("active");
        this.overlay?.remove();
        this.overlay = null;
        this.isOpen = false;
        document.body.style.overflow = "";
        this.stopAutoplay();
        this._visibleSlides.clear(); // Clear loaded slides when closing
    }

    goToSlide(index) {
        this.currentIndex = (index + this.items.length) % this.items.length;
        this.sliderTrack.style.transform = `translateX(-${
            this.currentIndex * 100
        }%)`;

        // Load current slide and adjacent slides
        this.loadAdjacentSlides();

        // Unload distant slides to save memory
        this.unloadDistantSlides(this.currentIndex);

        // Update counter
        this.updateCounter();

        // Update thumbnails
        this.updateThumbnails();

        // Reset zoom when changing slides
        this.resetZoom();
    }

    loadAdjacentSlides() {
        const preloadCount = 2; // Number of slides to preload on each side
        const totalSlides = this.items.length;

        // Always load current slide
        this.loadSlideContent(this.currentIndex);

        if (this._visibleSlides.size === 0) return;
        // Load previous slides
        for (let i = 1; i <= preloadCount; i++) {
            const prevIndex =
                (this.currentIndex - i + totalSlides) % totalSlides;
            if (!this._visibleSlides.has(prevIndex)) {
                this.loadSlideContent(prevIndex);
            }
        }

        // Load next slides
        for (let i = 1; i <= preloadCount; i++) {
            const nextIndex = (this.currentIndex + i) % totalSlides;
            if (!this._visibleSlides.has(nextIndex)) {
                this.loadSlideContent(nextIndex);
            }
        }
    }

    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }

    updateCounter() {
        if (this.counterElement) {
            this.counterElement.textContent = `${this.currentIndex + 1} / ${
                this.items.length
            }`;
        }
    }

    handleKeyboard(e) {
        if (!this.isOpen) return;
        if (e.key === "Escape") this.close();
        if (e.key === "ArrowRight") this.nextSlide();
        if (e.key === "ArrowLeft") this.prevSlide();
        if (e.key === "+" || e.key === "=") this.zoomIn();
        if (e.key === "-") this.zoomOut();
        if (e.key === "0") this.resetZoom();
    }

    startAutoplay() {
        this.stopAutoplay();
        this._autoplayInterval = setInterval(() => {
            const isVisible = this._visibleSlides.has(this.currentIndex);
            if (!isVisible) return;

            this.nextSlide();
        }, this.autoplaySpeed);
    }

    stopAutoplay() {
        if (this._autoplayInterval) {
            clearInterval(this._autoplayInterval);
            this._autoplayInterval = null;
        }
    }

    toggleAutoplay(buttonEl) {
        if (this._autoplayInterval) {
            this.stopAutoplay();
            if (buttonEl) buttonEl.textContent = "▶";
        } else {
            this.startAutoplay();
            if (buttonEl) buttonEl.textContent = "⏸";
        }
    }

    // Zoom functionality
    zoomIn(centerX, centerY) {
        if (this._zoomLevel >= this._maxZoom) return;

        const currentImg = this.getCurrentImage();
        if (!currentImg) return;

        this._zoomLevel = Math.min(
            this._zoomLevel + this._zoomStep,
            this._maxZoom,
        );
        this.applyZoom(currentImg, centerX, centerY);
        this._isZoomed = true;
    }

    zoomOut() {
        if (this._zoomLevel <= this._minZoom) return;

        const currentImg = this.getCurrentImage();
        if (!currentImg) return;

        this._zoomLevel = Math.max(
            this._zoomLevel - this._zoomStep,
            this._minZoom,
        );
        this.applyZoom(currentImg);

        if (this._zoomLevel === this._minZoom) {
            this._isZoomed = false;
        }
    }

    resetZoom() {
        const currentImg = this.getCurrentImage();
        if (!currentImg) return;

        this._zoomLevel = this._minZoom;
        currentImg.style.transform = `scale(${this._zoomLevel})`;
        this._isZoomed = false;
        this._currentTransform = { x: 0, y: 0 };
        currentImg.style.cursor = "grab";
    }

    applyZoom(img, centerX, centerY) {
        if (this._zoomLevel === this._minZoom) {
            img.style.transform = `scale(${this._zoomLevel})`;
            this._currentTransform = { x: 0, y: 0 };
        } else {
            img.style.transform = `scale(${this._zoomLevel})`;
            img.style.cursor = "grab";
        }
    }

    getCurrentImage() {
        const slides = this.sliderTrack.querySelectorAll(".pngallery-slide");
        if (slides[this.currentIndex]) {
            return slides[this.currentIndex].querySelector(".pngallery-img");
        }
        return null;
    }

    // Panning functionality
    handlePanStart(e, img) {
        if (!this._isZoomed) return;

        this._isPanning = true;
        const clientX = e.type.includes("touch")
            ? e.touches[0].clientX
            : e.clientX;
        const clientY = e.type.includes("touch")
            ? e.touches[0].clientY
            : e.clientY;

        this._panStart = {
            x: clientX - this._currentTransform.x,
            y: clientY - this._currentTransform.y,
        };
        img.style.cursor = "grabbing";
        img.style.transition = "none";
    }

    handlePanMove(e, img) {
        if (!this._isPanning || !this._isZoomed) return;

        const clientX = e.type.includes("touch")
            ? e.touches[0].clientX
            : e.clientX;
        const clientY = e.type.includes("touch")
            ? e.touches[0].clientY
            : e.clientY;

        const deltaX = clientX - this._panStart.x;
        const deltaY = clientY - this._panStart.y;

        const bounds = this.calculatePanBounds(img);

        this._currentTransform.x = Math.max(
            Math.min(deltaX, bounds.maxX),
            bounds.minX,
        );
        this._currentTransform.y = Math.max(
            Math.min(deltaY, bounds.maxY),
            bounds.minY,
        );

        img.style.transform = `scale(${this._zoomLevel}) translate(${this._currentTransform.x}px, ${this._currentTransform.y}px)`;
    }

    handlePanEnd(img) {
        if (!this._isPanning) return;

        this._isPanning = false;
        img.style.cursor = "grab";
        img.style.transition = "transform 0.3s ease";
    }

    calculatePanBounds(img) {
        const imgRect = img.getBoundingClientRect();
        const containerRect = img.parentElement.getBoundingClientRect();

        const scale = this._zoomLevel;
        const scaledWidth = imgRect.width * scale;
        const scaledHeight = imgRect.height * scale;

        const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
        const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

        return {
            minX: -maxX,
            maxX: maxX,
            minY: -maxY,
            maxY: maxY,
        };
    }

    // Touch handlers for sliding
    handleTouchStart(e) {
        if (this._isZoomed) return;
        this._touchStartX = e.changedTouches[0].screenX;
        this.sliderTrack.style.transition = "none";
    }

    handleTouchMove(e) {
        if (this._isZoomed || !this._touchStartX) return;
        this._touchEndX = e.changedTouches[0].screenX;
        const diff = this._touchStartX - this._touchEndX;
        const translateX =
            -this.currentIndex * 100 + (diff / window.innerWidth) * 100;
        this.sliderTrack.style.transform = `translateX(-${translateX}%)`;
    }

    handleTouchEnd(e) {
        if (this._isZoomed || !this._touchStartX) return;
        this.sliderTrack.style.transition = "transform 0.5s ease";
        const diff = this._touchStartX - this._touchEndX;
        if (Math.abs(diff) > this._swipeThreshold) {
            if (diff > 0) this.nextSlide();
            else this.prevSlide();
        } else {
            this.goToSlide(this.currentIndex);
        }
        this._touchStartX = 0;
        this._touchEndX = 0;
    }

    // Mouse drag handlers for sliding
    handleMouseDown(e) {
        if (this._isZoomed) return;
        if (e.button !== 0) return;

        this._isDragging = true;
        this._mouseStartX = e.clientX;
        this.sliderTrack.style.transition = "none";
        this.sliderTrack.style.cursor = "grabbing";
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (this._isZoomed || !this._isDragging) return;
        this._mouseEndX = e.clientX;
        const diff = this._mouseStartX - this._mouseEndX;
        const translateX =
            -this.currentIndex * 100 + (diff / window.innerWidth) * 100;
        this.sliderTrack.style.transform = `translateX(-${translateX}%)`;
    }

    handleMouseUp(e) {
        if (this._isZoomed || !this._isDragging) return;
        this._isDragging = false;
        this.sliderTrack.style.transition = "transform 0.5s ease";
        this.sliderTrack.style.cursor = "grab";

        if (
            this._mouseEndX === 0 &&
            !e.target.classList.contains("pngallery-img") &&
            !e.target.classList.contains("pngallery-document") &&
            !e.target.classList.contains("pngallery-audio") &&
            !e.target.classList.contains("pngallery-video")
        ) {
            this.close();
            return;
        }
        if (
            this._mouseEndX === 0 &&
            (e.target.classList.contains("pngallery-img") ||
                e.target.classList.contains("pngallery-document") ||
                e.target.classList.contains("pngallery-audio") ||
                e.target.classList.contains("pngallery-video"))
        ) {
            return;
        }
        const diff = this._mouseStartX - this._mouseEndX;
        if (Math.abs(diff) > this._swipeThreshold) {
            if (diff > 0) this.nextSlide();
            else this.prevSlide();
        } else {
            this.goToSlide(this.currentIndex);
        }
        this._mouseStartX = 0;
        this._mouseEndX = 0;
    }
}
