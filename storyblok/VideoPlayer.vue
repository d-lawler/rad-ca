<template>
    <div v-editable="blok" class="video-player" :class="[
        `aspect-${blok.aspect_ratio || '16-9'}`,
        { 'full-width': blok.full_width }
    ]">
        <div class="video-container" @click="handleVideoClick">
            <!-- Video cover/thumbnail (plays when not clicked) -->
            <div v-if="!isPlaying && (blok.video_cover || blok.poster_image)" class="video-preview">
                <!-- Looping video cover -->
                <video
                    v-if="blok.video_cover && !coverError"
                    :src="blok.video_cover.filename"
                    class="video-cover"
                    autoplay
                    muted
                    loop
                    playsinline
                    @error="handleCoverError"
                    :poster="blok.poster_image?.filename"
                />

                <!-- Fallback poster image -->
                <NuxtImg
                    v-else-if="blok.poster_image"
                    :src="blok.poster_image.filename"
                    :alt="blok.poster_image.alt || 'Video thumbnail'"
                    class="poster-image"
                    loading="lazy"
                    format="webp"
                    quality="80"
                />

                <!-- Play button overlay -->
                <div class="play-button-overlay">
                    <div class="play-button">
                        play video
                    </div>
                </div>
            </div>

            <!-- HTML5 video with controls (plays when clicked) -->
            <video
                v-if="isPlaying && blok.main_video_url"
                :src="blok.main_video_url"
                class="video-main"
                controls
                autoplay
                :loop="blok.loop"
                :muted="blok.muted"
                :poster="blok.poster_image?.filename"
            />

            <!-- Fallback for no video -->
            <div v-if="!blok.main_video_url || (!blok.video_cover && !blok.poster_image && !isPlaying)" class="video-error">
                <p v-if="!blok.main_video_url">No video URL provided.</p>
                <p v-else>No preview available. Click to play video.</p>
            </div>
        </div>

        <!-- Optional caption -->
        <div v-if="blok.caption" class="video-caption">
            {{ blok.caption }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ blok: Object })

// State management
const isPlaying = ref(false)
const coverError = ref(false)

// Handle video cover error
const handleCoverError = () => {
    coverError.value = true
}

// Handle click to play video
const handleVideoClick = () => {
    if (!isPlaying.value && props.blok.main_video_url) {
        isPlaying.value = true
    }
}
</script>

<style scoped>
.video-player {
    width: 100%;
    margin: 2rem 0;
}

.video-player.full-width {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    width: 100vw;
}

.video-container {
    position: relative;
    width: 100%;
    height: 0;
    overflow: hidden;
    background: #000;
    cursor: pointer;
}

/* Aspect ratio variants */
.video-player.aspect-16-9 .video-container {
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-player.aspect-4-3 .video-container {
    padding-bottom: 75%; /* 4:3 aspect ratio */
}

.video-player.aspect-21-9 .video-container {
    padding-bottom: 42.857%; /* 21:9 aspect ratio */
}

.video-player.aspect-1-1 .video-container {
    padding-bottom: 100%; /* 1:1 aspect ratio */
}

.video-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.video-cover,
.poster-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease;
}

.play-button-overlay:hover {
    background: rgba(0, 0, 0, 0.5);
}

.play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s ease;
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    border-bottom: 2px solid #fff;
    padding-bottom: 3px;
    font-family: 'GT America Mono', monospace;
    font-weight: 500; 
    font-size: 14px;
    line-height: 120%; 
    letter-spacing: 0.1em;
}

.video-main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.video-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #666;
    padding: 2rem;
}

.video-error p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
}

.video-caption {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .video-player {
        margin: 1.5rem 0;
    }

    .play-button {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
    }

    .video-caption {
        font-size: 0.8rem;
        margin-top: 0.75rem;
    }
}

@media (max-width: 480px) {
    .video-player {
        margin: 1rem 0;
    }

    .play-button {
        padding: 0.3rem 0.6rem;
        font-size: 0.75rem;
    }

    .video-error {
        padding: 1rem;
    }

    .video-error p {
        font-size: 0.9rem;
    }

    .video-caption {
        font-size: 0.75rem;
        margin-top: 0.5rem;
    }
}

/* Full width adjustments on smaller screens */
@media (max-width: 768px) {
    .video-player.full-width {
        margin-left: -1rem;
        margin-right: -1rem;
        width: calc(100% + 2rem);
    }
}
</style>