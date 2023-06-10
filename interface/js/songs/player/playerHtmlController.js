class PlayerHtmlController {
    #viewController = null
    #player = null
    #player_image = null
    #player_slider = null
    #audioElement = null
    #playButton = null
    #pauseButton = null
    #shuffleButton = null
    #shuffleState = false;
    #repeatButton = null
    #repeatState = false;


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

        const playPauseButtonContainer = document.createElement('div');
        playPauseButtonContainer.classList.add('menu_player_button_container')
        playPauseButtonContainer.id = 'menu_player_play_pause_button_container';

        const playButton = await this.#convertSVGInline('icons/play/play.svg');
        playButton.id = 'menu_player_play_button';
        playButton.classList.add('menu_player_button');
        this.#playButton = playButton

        const pauseButton = await this.#convertSVGInline('icons/play/pause.svg');
        pauseButton.id = 'menu_player_pause_button';
        pauseButton.classList.add('menu_player_button');
        pauseButton.style.display = 'none'
        this.#pauseButton = pauseButton

        playPauseButtonContainer.appendChild(playButton);
        playPauseButtonContainer.appendChild(pauseButton);

        const nextSongButtonContainer = document.createElement('div');
        nextSongButtonContainer.classList.add('menu_player_button_container');

        const nextSongButton = await this.#convertSVGInline('icons/play/forward.svg');
        nextSongButton.id = 'menu_player_next_song_button';
        nextSongButton.classList.add('menu_player_button');

        nextSongButtonContainer.appendChild(nextSongButton);

        const repeatButtonContainer = document.createElement('div');
        repeatButtonContainer.classList.add('menu_player_button_container');

        const repeatButton = await this.#convertSVGInline('icons/play/repeat.svg');
        repeatButton.id = 'menu_player_repeat_button';
        repeatButton.classList.add('menu_player_button');
        this.#repeatButton = repeatButton

        repeatButtonContainer.appendChild(repeatButton);
        repeatButtonContainer.addEventListener('click', () => {
            this.#toggleRepeat();
        })

        const audioElem = document.createElement('audio');
        audioElem.id = 'menu_player_audio';
        audioElem.addEventListener('ended', () => {
            //tell player that song has ended
        })
        this.#audioElement = audioElem

        buttonsContainer.appendChild(shuffleButtonContainer);
        buttonsContainer.appendChild(prevSongButtonContainer);
        buttonsContainer.appendChild(playPauseButtonContainer);
        buttonsContainer.appendChild(nextSongButtonContainer);
        buttonsContainer.appendChild(repeatButtonContainer);

        playButtonContainer.appendChild(playerSlider);
        playButtonContainer.appendChild(buttonsContainer);

        playerContainer.appendChild(iconContainer);
        playerContainer.appendChild(playButtonContainer);
        playerContainer.appendChild(audioElem);

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

    setPlayerSongImage(src) {
        this.#player_image.src = src;
    }

    setSliderValue(value) {
        this.#player_slider.value = value;
    }

    setAudioSource(source) {
        this.#audioElement.src = source
    }

    setVolume(value) {
        this.#audioElement.volume = value
    }

    setPlayState(state) {
        if (state) {
            this.#audioElement.play();
            this.#setContinusProgress();
        } else {
            this.#audioElement.pause();
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
        const audioElement = this.#audioElement
        const sliderElement = this.#player_slider
        const currentTime = audioElement.currentTime
        const duration = audioElement.duration
        const playState = this.#player.getPlayState()
        
        const progress = 100 * (currentTime / duration)

        if (playState == false) {
            return
        }
        sliderElement.value = progress
        /*
        stretchedProgress = progress * 2.6
        roundSliderElement.style.strokeDashoffset = 6630 - stretchedProgress
        */
        requestAnimationFrame(() => this.#setContinusProgress());
    }

    #setProgress(progress) {
        const audioElement = this.#audioElement;
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
            this.#shuffleButton.style.fill = 'red'
        }
    }

    #toggleRepeat() {
        if (this.#repeatState) {
            this.#repeatState = false
            this.#repeatButton.style.fill = '#ffffff'
        } else {
            this.#repeatState = true
            this.#repeatButton.style.fill = 'red'
        }
    }
}