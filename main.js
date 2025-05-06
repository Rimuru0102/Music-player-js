const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "RIMURU_PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Click Pow Get Down",
            singer: "Raftaar x Fortnite",
            path: "./Songs/Click Pow Get Down - Fortnite Lobby Music ft. Raftaar.mp3",
            image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg",
        },
        {
            name: "Tu Phir Se Aana",
            singer: "Raftaar x Salim Merchant x Karma",
            path: "./Songs/RAFTAAR Ft. SALIM MERCHANT & KARMA - Tu Phir Se Aana BAR'ISH EP.mp3",
            image: "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg",
        },
        {
            name: "Chúng ta của tương lai",
            singer: "Sơn Tùng M-TP",
            path: "./Songs/[SPOTDOWNLOADER.COM] Chúng Ta Của Tương Lai.mp3",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkybI9cfShr95hQfpszF_sbycEBgO-t_0hdw&s",
        },
        {
            name: "Chúng ta của hiện tại",
            singer: "Sơn Tùng M-TP",
            path: "./Songs/Chúng Ta Của Hiện Tại.mp3",
            image: "https://kenh14cdn.com/203336854389633024/2021/1/2/chung-ta-cua-sau-nay-16095786925961956370308.png",
        },
        {
            name: "Nơi này có anh",
            singer: "Sơn Tùng M-TP",
            path: "./Songs/Nơi Này Có Anh.mp3",
            image: "https://kenh14cdn.com/2017/sontung2-1487156115154.jpg",
        },
        {
            name: "Damn",
            singer: "Raftaar x kr$na",
            path: "./Songs/Damn - From _Mr. Nair_.mp3",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRndxkQh_HzEbHNyM-bcYgLukYsXsTMzHNQfA&s",
        },
        {
            name: "Đừng làm trái tim anh đău",
            singer: "Sơn tùng M-TP",
            path: "./Songs/Đừng Làm Trái Tim Anh Đau.mp3",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp5j8-7iCY82Fcnrk74M2YhKAbzMtdYyPWrQ&s",
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class = "song ${
                index === this.currentIndex ? "active" : ""
            }" data-index = ${index}>
                <div class = "thumb" style = "background-image: url(${
                    song.image
                })">
                </div>

                <div class = "body">
                    <h3 class = "title">${song.name}</h3>
                    <p class = "author">${song.singer}</p>
                </div>
                
                <div class = "option">
                    <i class = "fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });

        playlist.innerHTML = htmls.join("");
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xử lý khi cd quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000,
                interation: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Khi tua
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            _this.render();
            _this.scrollToActiveSong();
            audio.play();
        };

        // khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            _this.render();
            _this.scrollToActiveSong();
            audio.play();
        };

        // Khi bật / tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Xử lý khi bật lặp lại song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            // xử lý khi click vào song
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào option
                // ........
            }
        };
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 300);
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function () {
        // gán cấu hình từ config vào app
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        // tải thông tin bài hát hiện tại vào UI
        this.loadCurrentSong();

        // render playlist
        this.render();

        // hiển thị trạng thái ban đầu của button random và repeat
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
