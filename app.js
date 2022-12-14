const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)


const PLAYER_STORAGE_KEY = "F8_PLAYER";


const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const audioVolumeBar = $('#audio-volume')
const currentVolume = $('.current-volume')
const audioVolumeWarn = $('.audio-control-volume-warn')
const volumeWarnClose = $('.volume-warn-close-btn')
const playList = $('.playlist')
const timer = $('.time-remain')
const progress = $('#progress')
const progressMaxValue = progress.max
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random') 
const repeatBtn = $('.btn-repeat') 



const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    randomPlayList: [0],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs: [
        {
            name: 'Waiting For Love',
            singer: 'Avicii',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jfif'
        },
        {
            name: 'The Nights',
            singer: 'Avicii',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jfif'
        },
        {
            name: 'Waka Waka',
            singer: 'Shakira',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jfif'
        },
        {
            name: 'Wavin Flag (CocaCola remix)',
            singer: 'K\'NAN',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jfif'
        },
        {
            name: 'Level',
            singer: 'Avicii',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jfif'
        },
        {
            name: 'We Are The People',
            singer: 'Martin Garrix',   
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.png'
        },
        {
            name: 'Wake Me Up',
            singer: 'Avicii',   
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jfif'
        }
    ],

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}');"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class= "fas fa-ellipsis-h"></i>
                </div>
            </div>
        `
        })
        playList.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth


        // X??? l?? CD quay / d???ng
        const cdThumbAnimate = cdThumb.animate([{ 
            transform: "rotate(360deg)"
        }], { 
            duration:  10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause()


        // X??? l?? ph??ng to / thu nh??? CD
        document.onscroll = function() {
            const scrollTop = window.scollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            const percentWhenCdBlur = 4/3
            const percentCdWidth = newCdWidth / cdWidth * percentWhenCdBlur
            // newCdWidth / (cdWidth / 100) * percentWhenCdBlur = newCdWidth / 2
            //                                                        ^ because newCdWidth if scoll all = 200 so newCdWidth / 2 = 100(%)
            //                                                          opacity only have effect when percentCdWidth = 100
            //                                                          so percentCdWidth * percentwhenBlur = 133..... that means if we scroll first 25% (133 * 25% = 33%, 133 - 33 = 100) the opacity won't effect
            cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0
            cd.style.opacity = `${percentCdWidth}`
        }

        // X??? l?? khi click play 
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // Khi song ???????c play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi song b??? pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // X??? l?? thanh ??m l?????ng khi c?? s??? thay ?????i tr??n thanh ??i???u khi???n ??m thanh
        audioVolumeBar.oninput = function(e) {
            audio.volume = e.target.value / audioVolumeBar.max
            currentVolume.textContent = e.target.value
        }

        // Khi ti???n ????? b??i h??t thay ?????i
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * progressMaxValue)
                // console.log((audio.duration - (audio.duration % 60)) / 60 + ':' + Math.floor(audio.duration % 60))
                const timeRemain = audio.duration - audio.currentTime
                let timeRemainAsMinute
                if (Math.floor(timeRemain % 60) < 10) {
                    timeRemainAsMinute = (timeRemain - (timeRemain % 60)) /60 + ':0' + Math.floor(timeRemain % 60)
                    timer.textContent = timeRemainAsMinute
                } else {
                    timeRemainAsMinute = (timeRemain - (timeRemain % 60)) /60 + ':' + Math.floor(timeRemain % 60)
                    timer.textContent = timeRemainAsMinute
                    
                }
                
                progress.value = progressPercent
            }
        }
        // X??? l?? khi tua b??i h??t
        progress.oninput = function(e) { 
            const seekTime = audio.duration * e.target.value / progressMaxValue
            audio.currentTime = seekTime
        }


        // X??? k?? ??i???u ch???nh thanh th??ng b??o khi m??n h??nh co nh???
        window.onresize = function() { 
            audioVolumeWarn.style.width = progress.offsetWidth+'px'
        }
        // X??? l?? t???t thanh th??ng b??o tr??n dashboard
        volumeWarnClose.onclick = function() {
            audioVolumeWarn.style.display = 'none'
        }


        // Khi next b??i h??t
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            
        }
        // Khi prev b??i h??t
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // X??? l?? b???t / t???t Random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // X??? l?? tua l???i t??? ?????u 1 b??i h??t
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Next khi h???t nh???c 
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // L???ng nghe h??nh vi click v??o playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')
            ) {
                // X??? l?? khi click v??o b??i h??t
                if (songNode) {
                    _this.currentIndex = parseInt(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // X??? l?? khi click v??o song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 200)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex>=this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex< 0) {
            this.currentIndex = this.songs.length -1 
        }
        this.loadCurrentSong()
    },

    // playRandomSong: function() {
    //     let newIndex
    //     do {
    //         newIndex = Math.floor(Math.random() * this.songs.length)
    //     } while (newIndex === this.currentIndex) 
    //     this.currentIndex = newIndex
    //     this.loadCurrentSong()
    // },
    
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (app.randomPlayList.includes(newIndex)) 
        
        const subRandomPlayList =  this.randomPlayList.concat([newIndex])
        this.randomPlayList = subRandomPlayList
        if (this.songs.length - this.randomPlayList.length == 0) {
            const subRandomPlayList = []
            this.randomPlayList = subRandomPlayList
        }
        
        this.currentIndex = newIndex
        this.loadCurrentSong()
    
    },
    

    start: function() {
        // G??n c???u h??nh config v??o app
        this.loadConfig()

        // L???y gi?? tr??? volume m???c ?????nh v?? xu???t ra m??n h??nh
        currentVolume.textContent = `${audioVolumeBar.value}`
        audio.volume = audioVolumeBar.value / audioVolumeBar.max

        // kh??c
        audioVolumeWarn.style.width = progress.offsetWidth+'px'
        timer.textContent = '0:00'
        

        // ?????nh ngh??a c??c thu???c t??nh cho Object
        this.defineProperties()



        // L???ng nghe v?? x??? l?? c??c s??? ki???n (DOM event)
        this.handleEvents()


        // T???i th??ng tin b??i h??t ?????u ti??n v??o UI khi ch???y ???ng d???ng
        this.loadCurrentSong() 


        // Render playlist
        app.render()

        // Hi???n th??? tr???ng th??i ban ?????u c???a btn repeat v?? random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()