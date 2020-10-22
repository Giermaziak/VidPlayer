var PT_vid_global;

document.addEventListener("DOMContentLoaded", function () { initVidPlayer(); }, false);
/* inicjalizacja kiedy dokument wczytany, dodaj fcje ładowania keidy dokument nie wczytany ale 
wykonano akcje na vid */
//dodaj całkowity czas po załadowaniu okna, oraz bg obrazu
//czy height musi być w .PT_VID divie?
//skrypt przeszukuje po np btnach a potem przypiuje do vid, powinno być na odwrót
//zapisz dynami8cznie szczerokośc paska głośności w evencie hover dla niego
//zmienne globalne do przestrzeni nazw a nie śmerdzące długie nazwy!

//dodaj fcje do buforowania wiecej niż 10-30 sec,


function initVidPlayer() {
    let vidAmount = document.querySelectorAll('.' + videoClassName).length;
    let vidList = new Array(vidAmount);// amount of vids
    PT_vid_global = new Array(vidAmount);

    for (let i = 0; i < vidAmount; i++) {// czy warto po ID? jesli to zmienie to moge wywalić ID z HTML
        vidList[i] = document.querySelectorAll('.' + videoClassName)[i].id;
        vidList[i] = document.querySelector('#' + vidList[i]); //heandlers vids

        PT_vid_global[i] = {
            "progBarPressed": false,
            "volumeBarPressed": false,
            "buffering": false,
            "clicked": null,
            "mousemove": null
        }
    }
    console.log("Amount of Vids: " + vidAmount);
    loadEvents(vidAmount, vidList);
}

//==== EVENTS ========

function loadEvents(vidAmount, vidList) {
    //bg_click
    let list = document.querySelectorAll('.' + bgcontrolsWrapp);
    for (let i = 0; i < list.length; i++) {
        list[i].addEventListener("click", function (ev) {
            if (PT_vid_global[i]["clicked"] == null) {
                PT_vid_global[i]["clicked"] = 1;
                setTimeout(function () {
                    bgClick(vidList[i], i)
                }, 200);
            }
            else
                PT_vid_global[i]["clicked"] += 1;
        });
    }

    //play-pause btn
    list = document.getElementsByClassName(playPauseClassName);//?
    for (let i = 0; i < list.length; i++) {
        list[i].addEventListener("click", function (ev) {
            //ev.preventDefault();
            let vidHeandler = ev.currentTarget.closest("." + vidBoxClassName).querySelector(".PT_video");
            if (vidHeandler.paused || vidHeandler.ended) {
                vidHeandler.play();
                vidHeandler.parentElement.querySelector("." + playPauseContAlt0).style.display = "none";
                vidHeandler.parentElement.querySelector("." + playPauseContAlt1).style.display = "block";
            }

            else {
                vidHeandler.pause();
                vidHeandler.parentElement.querySelector("." + playPauseContAlt0).style.display = "block";
                vidHeandler.parentElement.querySelector("." + playPauseContAlt1).style.display = "none";
            }
        });
    }
    //----------------------------------------
    //clock(next to PPbtn), progressbar
    for (let i = 0; i < vidAmount; i++) {

        vidList[i].addEventListener("timeupdate", function (ev) {
            if (!PT_vid_global[i]["progBarPressed"]) {
                //clock, next to PPbtn
                let cTime = vidList[i].currentTime;
                cTime = vidClock(cTime);
                vidList[i].parentElement.querySelector("." + timerCurrClassName).innerHTML = (cTime);
                vidList[i].parentElement.querySelector("." + timerMaxClassName).innerHTML = vidClock(vidList[i].duration);

                //progresbar
                let progresBarStatus = vidList[i].currentTime / vidList[i].duration;
                progresBarStatus = ((progresBarStatus * 100).toFixed(5));
                vidList[i].parentElement.querySelector("." + progresBarProgresClassName).style.width = (progresBarStatus + "%");
            }
        });
    }
    //---------------------
    //progresbar - video time
    //mosuedown   
    list = document.querySelectorAll('.' + progresBarClassName);
    for (let i = 0; i < vidAmount; i++) {

        list[i].addEventListener("mousedown", function (ev) {
            PT_vid_global[i]["progBarPressed"] = true;

            window.addEventListener("mousemove", function progFunMove(e) {
                if (!PT_vid_global[i]["progBarPressed"]) {
                    window.removeEventListener("mousemove", progFunMove);
                    return 0;
                }
                let timeArr = progresBarEvents(e, list[i], vidList[i]);
                vidList[i].parentElement.querySelector("." + timerCurrClassName).innerHTML = (timeArr['timer']);
                vidList[i].parentElement.querySelector("." + progresBarProgresClassName).style.width = (timeArr['progres'] + "%");
            });

            window.addEventListener("mouseup", function progFunUp(e) {
                PT_vid_global[i]["progBarPressed"] = false;
                let timeArr = progresBarEvents(e, list[i], vidList[i]);
                vidList[i].parentElement.querySelector("." + timerCurrClassName).innerHTML = (timeArr['timer']);
                vidList[i].parentElement.querySelector("." + progresBarProgresClassName).style.width = (timeArr['progres'] + "%");
                vidList[i].currentTime = timeArr['time'];
                window.removeEventListener("mouseup", progFunUp);
            });

        });
    }
    //-----------------------
    ////bufferProgresBar
    for (let i = 0; i < vidAmount; i++) {////dodaj fcje do buforowania wiecej niż 10-30 sec, event nie odpala na firefoxie

        vidList[i].addEventListener("progress", function (ev) {
            let currBuffParts = vidList[i].buffered.length;
            let currTime = vidList[i].currentTime;
            for (let j = 0; j < currBuffParts; j++) {
                if (vidList[i].buffered.start(j) <= currTime && vidList[i].buffered.end(j) >= currTime) {
                    let progresBarStatus = vidList[i].buffered.end(j) / vidList[i].duration;
                    progresBarStatus = ((progresBarStatus * 100).toFixed(5));
                    vidList[i].parentElement.querySelector("." + progresBarBufferClassName).style.width = (progresBarStatus + "%");
                    //console.log("obecny zakres", j, "bufor:", vidList[i].buffered.end(j));
                }
            }
        });
    }

    //---------------------------
    //volume mouse over
    delete list;
    let listVol = document.querySelectorAll('.' + volumeWrappClassName);
    for (let i = 0; i < vidAmount; i++) {

        let barBox = listVol[i].querySelector("." + volumeVolBarClassName);
        listVol[i].addEventListener("mouseover", function (ev) {

            barBox.style.cssText
                = "opacity: 1; width: 5em; padding: 0 0.5em;";
        });

        listVol[i].addEventListener("mouseout", function (ev) {
            if (!PT_vid_global[i]["volumeBarPressed"]) {
                barBox.style.cssText
                    = "opacity: 0; width: 0em; padding: 0 0em;";
            }
            else
                setTimeout(function () {
                    volMouseExit(listVol[i]);
                }, 200);
        });
    }
    //---------------------------
    //fullScreen
    let FC_list = document.querySelectorAll('.' + fullScreenBtnClassName);
    for (let i = 0; i < vidAmount; i++) {
        FC_list[i].addEventListener("click", function (ev) {
            fullScreenSwitcher(FC_list[i]);
        });
    }
    //-----------------------
    //voloume
    listVol = document.querySelectorAll('.' + volumeVolBarClassName);
    for (let i = 0; i < vidAmount; i++) {

        listVol[i].addEventListener("mousedown", function (ev) {
            PT_vid_global[i]["volumeBarPressed"] = true;

            window.addEventListener("mousemove", function VolFunMove(e) {
                if (!PT_vid_global[i]["volumeBarPressed"]) {
                    window.removeEventListener("mousemove", VolFunMove);
                    return 0;
                }
                let out = volumeBarEvents(e, listVol[i]);
                vidList[i].volume = out["volumePerc"] / 100;
                vidList[i].parentElement.querySelector("." + volumeVolBarPointerClassName).style.left = (out["pointPos"] + "px");
            });

            window.addEventListener("mouseup", function VolFunMove(e) {
                PT_vid_global[i]["volumeBarPressed"] = false;
                window.removeEventListener("mouseup", VolFunMove);
            });

        });
    }

    //-----------------------
    //settings button

    listSet = document.querySelectorAll('.' + settingsButtonClassName);
    for (let i = 0; i < vidAmount; i++) {

        listSet[i].addEventListener("click", function (ev) {

            if (ev.target === this) {
                let settBox = listSet[i].querySelector("." + settingsBoxClassName);
                if (settBox.style.display == "block")
                    settBox.style.display = "none"
                else
                    settBox.style.display = "block"
            }

        });
    }
    //-------------------------------
    //loading data/ lack of data

    for (let i = 0; i < vidAmount; i++) {

        vidList[i].addEventListener("waiting", function (ev) {
            let canvHolder = vidList[i].parentElement.querySelector("." + canvansBoxClassName);
            canvHolder.style.display = "block";
            PT_vid_global[i]["buffering"] = true;
            bufferingGif(vidList[i], i);
        });

        vidList[i].addEventListener("playing", function (ev) {
            PT_vid_global[i]["buffering"] = false;
        });
    }
    //-----------------------
    //mosuemove vid - hide controls
    listVidBox = document.querySelectorAll('.' + vidBoxClassName);//dodaj zsuwanie pod div, triggernij jesli wciśnieto klaiwsz kawatury
    for (let i = 0; i < vidAmount; i++) {

        listVidBox[i].addEventListener("mousemove", function (ev) {

            let full = (document.fullscreenElement || document.webkitFullscreenElement ||
                document.mozFullScreenElement) ? true : false;

            if (full) {
                if (PT_vid_global[i]["mousemove"] === null) {
                    PT_vid_global[i]["mousemove"] = 6;
                    videoMouseMove(ev, i);
                }
                else {
                    PT_vid_global[i]["mousemove"] = 6;
                }
            }
            else {
                PT_vid_global[i]["mousemove"] = null
                videoMouseMove(ev, i);
            }



        });
    }

};


/** buforowanie  na gecie*/
/*
myVid = vidHeandler;


var r = new XMLHttpRequest();
r.onload = function () {
    myVid.src = URL.createObjectURL(r.response);
    myVid.play();
};
if (myVid.canPlayType('video/mp4;codecs="avc1.42E01E, mp4a.40.2"')) {
    r.open("GET", "videos/bunny/Vid_000_720.mp4");
}
else {
    r.open("GET", "videos/bunny*Vid_000_720.mp4");
}

r.responseType = "blob";
r.send();
*/
/** */