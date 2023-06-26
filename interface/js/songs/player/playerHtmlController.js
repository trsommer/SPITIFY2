class PlayerHtmlController {
    #viewController = null
    #player = null
    #player_image = null
    #player_slider = null
    #audioElements = []
    #currentAudioElementIndex = 0
    #playButton = null
    #pauseButton = null
    #shuffleButton = null
    #shuffleState = false;
    #volumeSlider = null
    #repeatButton = null
    #repeatButtonOnce = null
    #repeatState = 0;
    #crossfadeOffset = 5;
    #crossfadeUpdates = 8;
    #crossfadeInProgress = false;


    constructor(viewController, player) {
        this.#viewController = viewController;
        this.#player = player;

        return this.#constructorFunction();
    }

    async #constructorFunction() {
        await this.setupHTML();

        return this;
    }

    
    /**
     * Asynchronously sets up the HTML elements required for the menu player. 
     * Creates and appends various divs and buttons to the HTML container.
     *
     * @return {Promise<void>} Promise that resolves when the HTML setup is complete.
     */
    async setupHTML() {
        const container = document.getElementById('menu_player_outer_container');
        container.classList.add('bottomLeft');

        const playerContainer = document.createElement('div');
        playerContainer.id = 'menu_player_container';

        const iconContainer = document.createElement('div');
        iconContainer.id = 'menu_player_icon_container';

        const iconImageContainer = document.createElement('div');
        iconImageContainer.id = 'menu_player_icon_image_container';

        const iconImage = document.createElement('img');
        iconImage.id = 'menu_player_icon_image';

        this.#player_image = iconImage

        iconImageContainer.appendChild(iconImage);
        iconContainer.appendChild(iconImageContainer);

        const playButtonContainer = document.createElement('div');
        playButtonContainer.id = 'menu_player_button_container';

        const playerSlider = document.createElement('input');
        playerSlider.id = 'menu_player_slider';
        playerSlider.type = 'range';
        playerSlider.min = '1.0';
        playerSlider.max = '100.0';
        playerSlider.value = '0.0';
        playerSlider.step = '0.0001';
        playerSlider.addEventListener('input', (event) => {
            const newProgress = event.target.value;
            this.#setProgress(newProgress);
        })

        this.#player_slider = playerSlider

        const controlsContainer = document.createElement("div");
        controlsContainer.id = "menu_player_controls_container";

        const buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'menu_player_buttons_container';

        const shuffleButtonContainer = document.createElement('div');
        shuffleButtonContainer.classList.add('menu_player_button_container');

        const shuffleButton = await this.#convertSVGInline('icons/play/shuffle.svg');
        shuffleButton.id = 'menu_player_shuffle_button';
        shuffleButton.classList.add('menu_player_button');
        this.#shuffleButton = shuffleButton

        shuffleButtonContainer.appendChild(shuffleButton);
        shuffleButtonContainer.addEventListener('click', () => {
            this.#toggleShuffle();
        })

        const prevSongButtonContainer = document.createElement('div');
        prevSongButtonContainer.classList.add('menu_player_button_container');

        const prevSongButton = await this.#convertSVGInline('icons/play/backward.svg');
        prevSongButton.id = 'menu_player_prev_song_button';
        prevSongButton.classList.add('menu_player_button');

        prevSongButtonContainer.appendChild(prevSongButton);
        prevSongButtonContainer.addEventListener('click', () => {
            this.#prevSongButton();
        })

        const playPauseButtonContainer = document.createElement('div');
        playPauseButtonContainer.classList.add('menu_player_button_container')
        playPauseButtonContainer.id = 'menu_player_play_pause_button_container';

        const playButton = await this.#convertSVGInline('icons/play/play.svg');
        playButton.id = 'menu_player_play_button';
        playButton.classList.add('menu_player_button');
        this.#playButton = playButton
        playButton.addEventListener("click", () => {
            this.#player.setPlayState(true);
        })

        const pauseButton = await this.#convertSVGInline('icons/play/pause.svg');
        pauseButton.id = 'menu_player_pause_button';
        pauseButton.classList.add('menu_player_button');
        pauseButton.style.display = 'none'
        this.#pauseButton = pauseButton
        pauseButton.addEventListener("click", () => {
            this.#player.setPlayState(false);
        })

        playPauseButtonContainer.appendChild(playButton);
        playPauseButtonContainer.appendChild(pauseButton);

        const nextSongButtonContainer = document.createElement('div');
        nextSongButtonContainer.classList.add('menu_player_button_container');

        const nextSongButton = await this.#convertSVGInline('icons/play/forward.svg');
        nextSongButton.id = 'menu_player_next_song_button';
        nextSongButton.classList.add('menu_player_button');

        nextSongButtonContainer.appendChild(nextSongButton);
        nextSongButtonContainer.addEventListener('click', () => {
            this.#player.playNextSong();
        })

        const repeatButtonContainer = document.createElement('div');
        repeatButtonContainer.classList.add('menu_player_button_container');

        const repeatButton = await this.#convertSVGInline('icons/play/repeat.svg');
        repeatButton.id = 'menu_player_repeat_button';
        repeatButton.classList.add('menu_player_button');
        this.#repeatButton = repeatButton

        const repeatButtonOnce = await this.#convertSVGInline('icons/play/repeatOnce.svg');
        repeatButtonOnce.id = 'menu_player_repeat_button_once';
        repeatButtonOnce.classList.add('menu_player_button');
        repeatButtonOnce.style.display = 'none'
        this.#repeatButtonOnce = repeatButtonOnce

        repeatButtonContainer.appendChild(repeatButton);
        repeatButtonContainer.appendChild(repeatButtonOnce);
        repeatButtonContainer.addEventListener('click', () => {
            this.#toggleRepeat();
        })

        //create audio elements (2 for crossfade)

        const audioElem1 = document.createElement('audio');
        audioElem1.id = 'menu_player_audio';
        this.#audioElements.push(audioElem1);
        audioElem1.addEventListener('ended', () => {
            this.#nonCrossfadeNextSong();
        })

        const audioElem2 = document.createElement('audio');
        audioElem2.id = 'menu_player_audio2';
        this.#audioElements.push(audioElem2);
        audioElem2.addEventListener('ended', () => {
            this.#nonCrossfadeNextSong();
        })

        buttonsContainer.appendChild(shuffleButtonContainer);
        buttonsContainer.appendChild(prevSongButtonContainer);
        buttonsContainer.appendChild(playPauseButtonContainer);
        buttonsContainer.appendChild(nextSongButtonContainer);
        buttonsContainer.appendChild(repeatButtonContainer);

        const volumeSlider = document.createElement('input');
        volumeSlider.type = "range";
        volumeSlider.id = 'menu_player_volume_slider';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.value = '0.5';
        volumeSlider.step = '0.0001';
        volumeSlider.addEventListener('input', (event) => {
            this.setVolume(event.target.value);
        })

        this.#volumeSlider = volumeSlider


        controlsContainer.appendChild(buttonsContainer);
        controlsContainer.appendChild(volumeSlider);

        playButtonContainer.appendChild(playerSlider);
        playButtonContainer.appendChild(controlsContainer);

        playerContainer.appendChild(iconContainer);
        playerContainer.appendChild(playButtonContainer);

        playerContainer.appendChild(audioElem1);
        playerContainer.appendChild(audioElem2);

        container.appendChild(playerContainer);
    }

    async #convertSVGInline(path) {
        const response = await fetch(path);
        const content = await response.text();

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, 'image/svg+xml');

        const svgElement = svgDoc.getElementsByTagName('svg')[0];

        return svgElement
    }

    /**
     * Sets the image source of the player.
     *
     * @param {string} src - The source of the image.
     */
    setPlayerSongImage(src) {
        this.#player_image.src = src;
    }

    /**
     * Sets the value of the slider for the player.
     *
     * @param {number} value - The value to set the slider to.
     */
    setSliderValue(value) {
        this.#player_slider.value = value;
    }

    /**
     * Sets the audio source of the current audio element.
     *
     * @param {string} source - The new audio source URL.
     */
    setAudioSource(source) {
        const currentAudioElem = this.#getCurrentAudioElement()

        currentAudioElem.src = source
    }

    setVolume(value) {
        const currentAudioElem = this.#getCurrentAudioElement()
        currentAudioElem.volume = value

        this.#volumeSlider.value = value
    }

    setPlayState(state) {
        const currentAudioElem = this.#getCurrentAudioElement()

        if (state) {
            currentAudioElem.play();
            this.#setContinusProgress();
        } else {
            currentAudioElem.pause();
        }
    }

    setPlayIcon(state) {
        if (state) {
            this.#playButton.style.display = 'none';
            this.#pauseButton.style.display = 'block';
        } else {
            this.#playButton.style.display = 'block';
            this.#pauseButton.style.display = 'none';
        }
    }

    #setContinusProgress() {
        const audioElement = this.#getCurrentAudioElement()
        const sliderElement = this.#player_slider
        const currentTime = audioElement.currentTime
        const duration = audioElement.duration
        const playState = this.#player.getPlayState()
        const timeLeft = duration - currentTime

        const progress = 100 * (currentTime / duration)

        if (playState == false) {
            return
        }

        if (timeLeft <= this.#crossfadeOffset && this.#crossfadeOffset > 0) {
            this.#crossfade();
        }

        sliderElement.value = progress
        /*
        stretchedProgress = progress * 2.6
        roundSliderElement.style.strokeDashoffset = 6630 - stretchedProgress
        */
        requestAnimationFrame(() => this.#setContinusProgress());
    }

    #setProgress(progress) {
        const audioElement = this.#getCurrentAudioElement();
        const duration = audioElement.duration
        const newProgress = duration * progress / 100
        audioElement.currentTime = newProgress
    }

    #toggleShuffle() {
        if (this.#shuffleState) {
            this.#shuffleState = false
            this.#shuffleButton.style.fill = '#ffffff'
        } else {
            this.#shuffleState = true
            this.#shuffleButton.style.fill = 'var(--accentColor)'
        }
    }

    #toggleRepeat() {
        if (this.#repeatState == 0) {
            //go from no repeat to repeat
            this.#repeatState = 1
            this.#repeatButtonOnce.style.display = 'none'
            this.#repeatButton.style.display = 'block'
            this.#repeatButton.style.fill = 'var(--accentColor)'

        } else if (this.#repeatState == 1) {
            //go from repeat to repeat once
            this.#repeatState = 2
            this.#repeatButtonOnce.style.display = 'block'
            this.#repeatButton.style.display = 'none'
            this.#repeatButtonOnce.style.fill = 'var(--accentColor)'

        } else {
            //go from repeat once to no repeat
            this.#repeatState = 0
            this.#repeatButton.style.display = 'block'
            this.#repeatButton.style.fill = '#ffffff'
            this.#repeatButtonOnce.style.fill = '#ffffff'
            this.#repeatButtonOnce.style.display = 'none'
        }
    }

    #getCurrentAudioElement() {
        const currentAudioElemIndex = this.#currentAudioElementIndex;
        const currentAudioElem = this.#audioElements[currentAudioElemIndex];

        return currentAudioElem
    }

    #switchAudioElements() {
        this.#currentAudioElementIndex = this.#currentAudioElementIndex == 0 ? 1 : 0
    }

    async #crossfade() {
            if (this.#crossfadeInProgress) return
            this.#crossfadeInProgress = true
            const oldAudioElem = this.#getCurrentAudioElement()
            this.#switchAudioElements() //switches audio elements to the new one
            const targets = await this.#player.onEndPlay() //starts playing of the next song
            const newAudioElem = this.#getCurrentAudioElement()
            newAudioElem.volume = 0

            const nrSteps = this.#crossfadeOffset * this.#crossfadeUpdates; //updates ever 200ms
            const stepOld = targets[0] / nrSteps
            const stepNew = targets[1] / nrSteps

            this.#crossFadeProgress(oldAudioElem, newAudioElem, stepOld, stepNew)
    }

    #crossFadeProgress(oldAudioElem, newAudioElem, stepOld, stepNew) {
        //old
        const currentVolumeOld = oldAudioElem.volume
        let newVolumeOld = currentVolumeOld - stepOld
        if (newVolumeOld < 0) {
            newVolumeOld = 0
        }
        oldAudioElem.volume = newVolumeOld

        //new
        const currentVolumeNew = newAudioElem.volume
        let newVolumeNew = currentVolumeNew + stepNew
        if (newVolumeNew > 1) {
            newVolumeNew = 1
        }
        newAudioElem.volume = newVolumeNew

        if (newVolumeOld == 0) {
            this.#crossfadeInProgress = false
            return
        }

        //call this function again after 200ms
        setTimeout(() => this.#crossFadeProgress(oldAudioElem, newAudioElem, stepOld, stepNew), 1000 / this.#crossfadeUpdates);
    }

    #nonCrossfadeNextSong() {
        if (this.#crossfadeOffset > 0) return

        this.#player.onEndPlay()
    }

    #prevSongButton() {
        const audioElement = this.#getCurrentAudioElement()
        const currentTime = audioElement.currentTime
        const duration = audioElement.duration
        const progress = 100 * (currentTime / duration)

        if (progress <= 5) {
            this.#player.playLastSong()
        }

        //go to beginning
        this.#setProgress(0)

    }
}