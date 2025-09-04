console.log("welcome")
let currsong = new Audio();
let songs
let currfolder
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');
    return `${paddedMins}:${paddedSecs}`;
}

async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
//show songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML= ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                        <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                             <div class="songname ">${song.replaceAll("%20", " ")}</div>
                             <div class="songartist ">Aryan</div>
                        </div>
                        <div class="playnow">
                            <img src="img/playnow.svg" alt="">
                        </div>
                       </li>`
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").getElementsByTagName("div")[0].textContent)
            //.innerHTML use nhi kara kyu vo &amp; jod de rh tha ek gane ki link me
            //chatgpt karke smj lo

            playmusic(e.querySelector(".info").firstElementChild.textContent.trim())
        })
    })
    return songs
    
}

const playmusic = (track, pause = false) => {
    //   let audio = new Audio("/songs/" + track)
    currsong.src = `/${currfolder}/` + track

    if (!pause) {
        currsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".scrolling-text").innerHTML = decodeURI(track)
    setTimeout(() => {
        const isOverflowing = document.querySelector(".scrolling-text").scrollWidth > document.querySelector(".songinfo").clientWidth;

        if (isOverflowing) {
            document.querySelector(".scrolling-text").textContent = decodeURI(`${track}    •    ${track}`);
            const distance = document.querySelector(".scrolling-text").scrollWidth;
            const duration = distance / 30; // Adjust speed here

            document.querySelector(".scrolling-text").style.animation = `marquee ${duration}s linear infinite`;
        } else {
            document.querySelector(".scrolling-text").style.animation = "none";
        }
    }, 50)

    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayalbum() {
    let a = await fetch(`/music/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        // console.log(e.href)
        if(e.href.includes("/music/")){
            // console.log(e.href)
            let folder =(e.href.split("/").slice(-2)[0])
            //get meta data of the folder
            let a = await fetch(`/music/${folder}/info.json`)
            let response = await a.json()
            document.querySelector(".cardContainer").innerHTML = document.querySelector(".cardContainer").innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg width="50px"  viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circle -->
                                <circle cx="50" cy="50" r="48" fill="rgb(29, 185, 84)" />

                                <!-- Black play triangle -->
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>

                        </div>
                        <img src="music/${folder}/cover.jpg" alt="">
                        <h2 class="s16px">${response.title}</h2>
                        <p class="s14px">${response.description}</p>
                    </div>`
        }
        
    }
    // load the playlist when the card is clicked
        Array.from(document.getElementsByClassName("card")).forEach (e=>{
        e.addEventListener("click",async item=>{
            songs = await getsongs(`music/${item.currentTarget.dataset.folder}`)
            //currtarget to listen only that element which is given
            //target to listen any thing in that thing
            console.log(songs)
            playmusic(songs[0])
        })
    })
}






async function main() {
    // await getsongs(`music/${currfolder}`)
    // console.log(songs)
    // playmusic(songs[0], true)

    //display all the albums on the page
    displayalbum()
    //attach event listner to play prev next
    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currsong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update event 
    currsong.addEventListener("timeupdate", () => {
        // console.log(currsong.currentTime, currsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`
        document.querySelector(".circle").style.left = ((currsong.currentTime / currsong.duration) * 100) - 1 + "%"
        document.querySelector(".progress").style.width = ((currsong.currentTime / currsong.duration) * 100) + "%";
    })

    //add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        //getBoundingclientrect ki jagah offsetWidth b istemal kar sakte
        document.querySelector(".circle").style.left = percent + "%"
        document.querySelector(".progress").style.width = percent + "%"
        currsong.currentTime = (currsong.duration * percent) / 100
        // console.log(currsong.duration*percent)
    })

    //event listener for hamburger
    document.querySelector(".burger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //prev next event listener
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1])
        }

    })

    //volume mute
    // document.querySelector(".volume>img").addEventListener("dblclick", e => {
    //     console.log(e.target)
    //     if(e.target.src == "img/volume.svg"){
    //         e.target.src = "img/mute.svg"
    //         currsong.volume = 0
    //     }
    //     else{
    //         e.target.src = "img/volume.svg"
    //         currsong.volume = .5
    //     }
    // })


    // Toggle volume slider on click
    // document.querySelector(".volume").addEventListener("click", (e) => {
    //     e.stopPropagation(); // Prevent click from bubbling
        
    //     if (document.getElementById("volume-slider").style.display === "block") {
    //         document.getElementById("volume-slider").style.display = "none";
    //     } else {
    //         document.getElementById("volume-slider").style.display = "block";
    //     }
    // });
    let clickTimeout = null;
let lastClickTime = 0;

const volumeIcon = document.querySelector(".volume > img");
const volumeSliderEl = document.getElementById("volume-slider"); // Renamed to avoid conflict

volumeIcon.addEventListener("click", (e) => {
    const now = Date.now();

    if (now - lastClickTime < 300) {
        // Handle double-click (mute/unmute)
        clearTimeout(clickTimeout);
        lastClickTime = 0;

        // console.log("Double click on volume icon");

        if (volumeIcon.src.endsWith("img/volume.svg")) {
            volumeIcon.src = "img/mute.svg";
            currsong.volume = 0;
            document.getElementById("volume-slider").value = 0
        } else {
            volumeIcon.src = "img/volume.svg";
            currsong.volume = 0.5;
            document.getElementById("volume-slider").value = 0.5
        }
    } else {
        // First click — wait to see if it's a double-click
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
            // Handle single click (toggle volume slider)
            if (volumeSliderEl.style.display === "block") {
                volumeSliderEl.style.display = "none";
            } else {
                volumeSliderEl.style.display = "block";
            }

            lastClickTime = 0;
        }, 300);
    }
});

    // Change volume on slider input
    document.getElementById("volume-slider").addEventListener("input", (e) => {
        currsong.volume = e.target.value;
    })



    // Hide slider when clicking outside
    document.addEventListener("click", (e) => {
        if (!document.querySelector(".volume").contains(e.target) && !document.getElementById("volume-slider").contains(e.target)) {
            document.getElementById("volume-slider").style.display = "none";
        }
        if(document.getElementById("volume-slider").style.display != "none"){
            setTimeout(() => {
                document.getElementById("volume-slider").style.display = "none"
            }, 3000);
        }

    });
    
    const volumeSlider = document.getElementById("volume-slider");

    // Prevent page from scrolling while using volume slider
    volumeSlider.addEventListener("touchstart", (e) => {
        e.stopPropagation();
    }, { passive: false });

    volumeSlider.addEventListener("touchmove", (e) => {
        e.preventDefault(); // Prevent scrolling
    }, { passive: false });
    volumeSlider.addEventListener("wheel", (e) => {
        e.preventDefault();
    }, { passive: false });
    window.addEventListener("resize", () => {
        const slider = document.getElementById("volume-slider");
        if (window.innerWidth < 500) {
            slider.style.display = "none";  // Hide slider if width < 500
        } else {
            slider.style.display = "block"; // Show slider if width >= 500 (optional)
        }
    });
    


}



main()