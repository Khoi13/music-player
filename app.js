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


        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{ 
            transform: "rotate(360deg)"
        }], { 
            duration:  10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause()


        // Xử lý phóng to / thu nhỏ CD
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

        // Xử lý khi click play 
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // Xử lý thanh âm lượng khi có sự thay đổi trên thanh điều khiển âm thanh
        audioVolumeBar.oninput = function(e) {
            audio.volume = e.target.value / audioVolumeBar.max
            currentVolume.textContent = e.target.value
        }

        // Khi tiến độ bài hát thay đổi
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
        // Xử lý khi tua bài hát
        progress.oninput = function(e) { 
            const seekTime = audio.duration * e.target.value / progressMaxValue
            audio.currentTime = seekTime
        }


        // Xử ký điều chỉnh thanh thông báo khi màn hình co nhỏ
        window.onresize = function() { 
            audioVolumeWarn.style.width = progress.offsetWidth+'px'
        }
        // Xử lý tắt thanh thông báo trên dashboard
        volumeWarnClose.onclick = function() {
            audioVolumeWarn.style.display = 'none'
        }


        // Khi next bài hát
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
        // Khi prev bài hát
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
        // Xử lý bật / tắt Random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý tua lại từ đầu 1 bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Next khi hết nhạc 
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')
            ) {
                // Xử lý khi click vào bài hát
                if (songNode) {
                    _this.currentIndex = parseInt(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xử lý khi click vào song option
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
        // Gán cấu hình config vào app
        this.loadConfig()

        // Lấy giá trị volume mặc định và xuất ra màn hình
        currentVolume.textContent = `${audioVolumeBar.value}`
        audio.volume = audioVolumeBar.value / audioVolumeBar.max

        // khác
        audioVolumeWarn.style.width = progress.offsetWidth+'px'
        timer.textContent = '0:00'
        

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()



        // Lắng nghe và xử lý các sự kiện (DOM event)
        this.handleEvents()


        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong() 


        // Render playlist
        app.render()

        // Hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()