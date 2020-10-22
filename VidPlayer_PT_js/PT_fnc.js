var videoClassName = "PT_video";
var playPauseClassName = "PT_vid_play-pause_btn";
var vidBoxClassName = "PT_vid_box";
var playPauseContAlt0 = "PT_vid_play-pause_btn_alt_0";
var playPauseContAlt1 = "PT_vid_play-pause_btn_alt_1";
var timerCurrClassName = "PT_vid_timer_curr";
var timerMaxClassName = "PT_vid_timer_max";
var bgcontrolsWrapp = "PT_vid_bg_controls";
//var progresBarContClassName = "PT_vid_progresBar_content";
var progresBarProgresClassName = "PT_vid_progresBar_progress";
var progresBarBufferClassName = "PT_vid_progresBar_buffer";
var progresBarClassName = "PT_vid_progressBar";
var canvansBoxClassName = "PT_vid_waiter_buffIcon";
var canvansClassName = "PT_vid_buffIcon_canvas";
var volumeVolBarClassName = "PT_vid_volume_volBar";
var volumeVolBarContClassName = "PT_vid_volume_volBar_cont";
var volumeVolBarPointerClassName = "PT_vid_volume_volBar_barHolder_Pointer";
var volumeWrappClassName = "PT_vid_volume_wrapp";
var fullScreenBtnClassName = "PT_vid_full-scr_btn";
var settingsButtonClassName = "PT_vid_resol-switcher";
var settingsBoxClassName = "PT_vid_menu_box";
var settBoxesClassName = ["PT_menu_main", "PT_menu_volume", "PT_menu_quality"];
var settBoxWrappClassName = "PT_vid_menu_list";
var settMainBoxVal = ["Pt_vid_sett_0", "Pt_vid_sett_1"];
var controlPanelClassName = "PT_vid_controls_panel";


var PT_qualityVidList = ["240", "360", "480", "720"];

function vidClock(time) {
    let formTime = Math.floor(time);
    let hours = Math.floor(formTime / (60 * 60));
    formTime = formTime % (60 * 60);
    let minutes = Math.floor(formTime / (60));
    formTime = formTime % (60);
    let seconds = formTime;

    return ((hours) ? hours + ':' : '')
        + ((hours) ? ((minutes > 9) ? minutes : '0' + minutes) : minutes) + ':'
        + ((seconds > 9) ? seconds : '0' + seconds);
}

function getPosition(element) {
    var clientRect = element.getBoundingClientRect();
    return {
        "left": clientRect.left + document.body.scrollLeft,
        "top": clientRect.top + document.body.scrollTop,
        "right": clientRect.right + document.body.scrollLeft,
        "top": clientRect.bottom + document.body.scrollTop
    };
}

function progresBarEvents(e, progDiv, video) {//e, list[i], vidList[i]
    let tmp = getPosition(progDiv);
    let progBarOut = 0;
    if ((e.pageX - tmp['left']) <= 0) {
        progBarOut = 0;
    }
    else if ((e.pageX - tmp['right']) >= 0) {
        progBarOut = 100;
    } else {
        progBarOut = (e.pageX - tmp['left']) / (tmp['right'] - tmp['left']);
        progBarOut = (progBarOut * 100).toFixed(5);
    }

    let timeTmp = Math.round((progBarOut / 100) * video.duration);
    let clock = vidClock(timeTmp);

    return arr = {
        "timer": clock,
        "progres": progBarOut,
        "time": timeTmp
    };
}

function volumeBarEvents(e, progDiv) {
    progDiv = progDiv.querySelector("." + volumeVolBarContClassName);
    let tmp = getPosition(progDiv);
    let progBarOut = 0;

    if ((e.pageX - tmp['left']) <= 0) {
        progBarOut = 0;
    }
    else if ((e.pageX - tmp['right']) >= 0) {
        progBarOut = 100;
    } else {
        progBarOut = (e.pageX - tmp['left']) / (tmp['right'] - tmp['left']);
        progBarOut = (progBarOut * 100).toFixed(5);
    }

    return tab = {
        "volumePerc": progBarOut,
        "pointPos": (progBarOut / 100) * (tmp['right'] - tmp['left'])
    };
}

function bufferingGif(vid, id, context = null, angleRight = false, end = 0, rotate = 0) {
    if (!PT_vid_global[id]["buffering"]) {
        let canvHolder = vid.parentElement.querySelector("." + canvansBoxClassName);
        canvHolder.style.display = "none";
        return 0;
    }

    if (context == null)
        constCanv = bufferingGifInit(vid);
    else
        constCanv = context;

    if (end == 2 || end == 0) {
        angleRight = !angleRight;
        end = 0;
    }

    let speeder = Math.sin(end / 2 * Math.PI);
    speeder = (speeder < 0.2) ? 2 : speeder * 10;
    end += 0.02 * speeder;

    if (end > 2)
        end = 2;
    end = parseInt(end * 100, 10) / 100;

    if (rotate > 360)
        roate = 0;
    rotate += 10;

    let tmpRot = rotate / 180;

    if (angleRight)
        bufferingGifDraw(constCanv, 0 + tmpRot, end + tmpRot);
    else
        bufferingGifDraw(constCanv, end + tmpRot, 2 + tmpRot);



    setTimeout(function () {
        bufferingGif(vid, id, constCanv, angleRight, end, rotate);
    }, 55);
}

function bufferingGifDraw(constCanv, start, end) {
    let context = constCanv["context"];
    let startAngle = (start + 1.5) * Math.PI;
    let endAngle = (end + 1.5) * Math.PI;

    context.restore();//?
    context.clearRect(0, 0, constCanv["x"], constCanv["y"]);

    context.beginPath();
    context.arc(constCanv["x"] / 2, constCanv["y"] / 2, constCanv["r"], startAngle, endAngle, false);
    context.lineWidth = 9;
    context.strokeStyle = '#e8e8e8';
    context.stroke();

    return constCanv;
}

function bufferingGifInit(vid) {
    let canv = vid.parentElement.querySelector("." + canvansClassName);
    let context = canv.getContext('2d');
    constCanv = {
        "x": canv.width,
        "y": canv.height,
        "r": 47,
        "context": context
    }

    constCanv = bufferingGifDraw(constCanv, 0, 0);
    return constCanv;
}

function bgClick(vid, id) {
    if (PT_vid_global[id]["clicked"] == 1) {
        let ppBtn = vid.closest("." + vidBoxClassName).querySelector("." + playPauseClassName);
        let event = new Event('click');
        ppBtn.dispatchEvent(event);
    }
    else {
        fullScreenSwitcher(vid);
    }

    PT_vid_global[id]["clicked"] = null;
}

function fullScreenSwitcher(video_btn) {
    let vidBox = video_btn.closest("." + vidBoxClassName);
    let full = (document.fullscreenElement || document.webkitFullscreenElement ||
        document.mozFullScreenElement) ? true : false;

    console.log("PT_vid[fullScreen]: ", !full);
    if (vidBox.requestFullscreen) {
        if (!full)
            vidBox.requestFullscreen();
        else
            document.exitFullscreen()
    } else if (vidBox.mozRequestFullScreen || vidBox.mozCancelFullScreen) { /* Firefox */
        if (!full)
            vidBox.mozRequestFullScreen();
        else
            document.mozCancelFullScreen()
    } else if (vidBox.webkitRequestFullscreen || vidBox.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        if (!full)
            vidBox.webkitRequestFullscreen();
        else
            document.webkitExitFullscreen
    } else if (vidBox.msRequestFullscreen || document.msExitFullscreen) { /* IE/Edge */
        if (!full)
            vidBox.msRequestFullscreen();
        else
            document.msExitFullscreen();
    }
    if(!full)//trigger mousemove on vid
        video_btn.closest("." + vidBoxClassName).dispatchEvent(new Event('mousemove'));
    
}

function volMouseExit(obj) {
    let event = new Event('mouseout');
    obj.closest('.' + volumeWrappClassName).dispatchEvent(event);
}

function settSwitcher(clickedElement, settBoxId) {
    clickedElement.closest("." + settBoxWrappClassName).style.display = "none";
    clickedElement.closest("." + settingsButtonClassName).querySelector("." + settBoxesClassName[settBoxId]).style.display = "block";
}

function speedVid(clickedElement, v_level) {
    clickedElement.closest("." + vidBoxClassName).querySelector("." + videoClassName).playbackRate = v_level;
    clickedElement.closest("." + settingsButtonClassName).querySelector("." + settMainBoxVal[0]).innerHTML = "x" + v_level;
}

function qualityVid(clickedElement, v_qual) {
    let video = clickedElement.closest("." + vidBoxClassName).querySelector("." + videoClassName);

    let path = vidPathQalityReplacer(video, v_qual);

    let paused = true;
    if (!video.paused)
        paused = false;

    video.pause();
    let vidCurrTime = video.currentTime;
    video.setAttribute('src', path);
    video.load();
    video.currentTime = vidCurrTime;
    if (!paused)
        video.play();
    clickedElement.closest("." + settingsButtonClassName).querySelector("." + settMainBoxVal[1]).innerHTML = (PT_qualityVidList[v_qual] + "p");
}

function vidPathQalityReplacer(video, currQality) {
    let src = video.getAttribute('src');
    let fpart = src.substring(0, src.lastIndexOf("_") + 1);
    let lpart = src.substring(src.lastIndexOf("."), src.lenght)
    return fpart + PT_qualityVidList[currQality] + lpart;
}

function videoMouseMove(ev, id, rek = false) {
    vid = ev.target.closest("." + vidBoxClassName).querySelector("." + controlPanelClassName);
    if (!rek) {
        vid.style.opacity = "1";
    }

    if (PT_vid_global[id]["mousemove"] !== null) {
        if (PT_vid_global[id]["mousemove"] <= 0) {
            PT_vid_global[id]["mousemove"] = null;
            vid.style.opacity = "0";
        }
        else {
            PT_vid_global[id]["mousemove"] -= 1;

            console.log(PT_vid_global[id]["mousemove"]);

            setTimeout(function () {
                videoMouseMove(ev, id, true);
            }, 1000);
        }
    }
    else {
        return 0;
    }

}