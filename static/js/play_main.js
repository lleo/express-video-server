/* globals PLAY_MAIN HTMLMediaElement $ */

(function(window, undefined){
//  var $ = window.$

  PLAY_MAIN = {
    init: initFn
  , canPlay: false
  , isFullscreen: false
  , overControls: false
  }

//  var videoId
//    , canvasId
//    , playBtnId
//    , pauseBtnId
//    , skipBtnId
//    , backBtnId
//    , reloadBtnId

  /*--- function declarations --- */
  function initFn(cfg) {
    var skipSec  = typeof cfg.skipSec == 'number'  ? cfg.skipSec  : 30
      , backSec  = typeof cfg.backSec == 'number'  ? cfg.backSec  : 5
      , initTime = typeof cfg.initTime == 'number' ? cfg.initTime : 0

    var videoId       = "#videoSource"
      , canvasId      = "#videoDisplay"
      , headerId      = "#header"
      , controlsId    = "#controls"
      , playBtnId     = "#play_btn"
      , playSymId     = "#play_sym"
      , playTxtId     = "#play_txt"
      , pauseBtnId    = "#pause_btn"
      , skipBtnId     = "#skip_btn"
      , backBtnId     = "#back_btn"
      , reloadBtnId   = "#reload_btn"
      , volumeRngId   = "#volume_rng"
      , volumeSymId   = "#volume_sym"
      , positionTimId = "#position_tim"
      , positionRngId = "#position_rng"
      , fullscreenId  = "#fullscreen_btn"

    document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(){
      var videoEl       = $(videoId)[0]
        , canvasEl      = $(canvasId)[0]
        , controlsEl    = $(controlsId)[0]
        , width         = videoEl.videoWidth   //bogus value at this point
        , height        = videoEl.videoHeight  //bogus value at this point
        , ctx           = canvasEl.getContext('2d')
        , volumeRngEl   = $(volumeRngId)[0]
        , volumeSymEl   = $(volumeSymId)[0]
        , positionTimEl = $(positionTimId)[0]
        , positionRngEl = $(positionRngId)[0]
        , fullscreenEl  = $(fullscreenId)[0]
        , timerId
        , timerFirstTime = true
        , overControls = false

      console.log("onDOMContentLoaded: width=%f; height=%f;", width, height)

      //HTMLMediaElement Constant
      var MEC = [ "HAVE_NOTHING"
                , "HAVE_METADATA"
                , "HAVE_CURRENT_DATA"
                , "HAVE_FUTURE_DATA"
                , "HAVE_ENOUGH_DATA" ]

      function onMM(evt) {
        function longTimerFn() {
          if (!overControls && ! $(controlsId).hasClass('hide') )
            $(controlsId).addClass('hide')
          timerFirstTime = true
          timerId = undefined
        }
        function shortTimerFn() {
          $(document.body).on('mousemove', onMM)

          if (timerId || timerFirstTime) {
            clearTimeout(timerId)
            timerFirstTime = false
            timerId = setTimeout(longTimerFn, 2000)
          }
        }

        $(document.body).off('mousemove', onMM)

        if ( $(controlsId).hasClass('hide') )
          $(controlsId).removeClass('hide')

        setTimeout(shortTimerFn, 50)
      }
      $(document.body).on('mousemove', onMM)

      function onMouseEnter(evt) {
        overControls = true
      }
      function onMouseLeave(_evt) {
        overControls = false
        function longTimerFn(evt) {
          if (!overControls && ! $(controlsId).hasClass('hide') )
            $(controlsId).addClass('hide')
          timerFirstTime = true
          timerId = undefined
        }
        setTimeout(longTimerFn, 50)
      }
      $(controlsId).on('mouseenter', onMouseEnter)
      $(controlsId).on('mouseleave', onMouseLeave)
      
      $(videoId).on('play', function onPlayStartCanvasTimer(evt){
        console.log("onPlayStartCanvasTimer: videoEl.id=%s", videoEl.id)

        function timerFn() {
          PLAY_MAIN._tid = undefined

          if (videoEl.paused || videoEl.ended) {
            console.log("timerFn: videoEl.paused(%o) || videoEl.ended(%o) => true"
                       , videoEl.paused, videoEl.ended)
            return
          }

          ctx.drawImage(videoEl, 0, 0, width, height)

          PLAY_MAIN._tid = setTimeout(timerFn, 20)
        }

        timerFn()
      })

      $(videoId).on('fullscreen', function onFullscreen(evt) {
        console.log("==========================================")
        console.log("FULLSCREEN EVENT DETECTED ON Video Element")
        console.log("==========================================")
      })

      $(videoId).on('canplay', function onCanPlay(evt) {
        PLAY_MAIN.canPlay = videoEl.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
        //PLAY_MAIN.canPlay = videoEl.readyState === 4

        console.log("onCanPlay: %s.readyState = %s(%o); set PLAY_MAIN.canPlay = %o"
                   , videoEl.id, MEC[videoEl.readyState], videoEl.readyState
                   , PLAY_MAIN.canPlay)
      })


      $(videoId).on('play', function onPlayMisc(evt){
        console.log("onPlayMisc: evt.target.id=%s", evt.target.id)
        $(headerId)[0].style.display = 'none';
      })


      $(videoId).on('pause', function onPauseMisc(evt){
        console.log("onPlayMisc: evt.target.id=%s", evt.target.id)
        $(headerId)[0].style.display = 'block';
      })


      $(videoId).on('playing', function onPlaying(evt){
        console.log("onPlaying: evt.target.id=%s", evt.target.id)
      })


      $(videoId).on('loadeddata', function onLoadedData(evt){
        console.log("onLoadedData: evt.target.id=%s", evt.target.id)

        // 'loadeddata' means that the HTMLMediaElement has loaded enough
        // data to display one frame.
        //
        // developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events says:
        //  "loadeddata" -> "The first frame of the media has finished loading"
        //
        // So I can grab the videoWidth and videoHeight of the video at this
        //  point, and set the canvasEl width and height.
        //
        width  = videoEl.videoWidth
        height = videoEl.videoHeight

        canvasEl.width  = width
        canvasEl.height = height

        //$(controlsId).

        console.log("onLoadedData: width=%f; height=%f;", width, height)

        // display first frame in canvasEl
        //
        ctx.drawImage(videoEl, 0, 0, width, height)

        // Set position max from videoEl.duration
        //
        console.log("onLoadedData: videoEl.duration=%f;", videoEl.duration)
        positionRngEl.max = videoEl.duration

        console.log("onLoadedData: initTime=%f;", initTime)
        videoEl.currentTime = initTime
      })

      $(videoId).on('seeked', function onSeeked(evt){
        console.log("onSeeked: evt.target.id=%s", evt.target.id)

        // display seeked frame when currentTime is manually changed
        //
        ctx.drawImage(videoEl, 0, 0, width, height)

      })

      $(videoId).on('seeking', function onSeeking(evt){
        console.log("onSeeking: evt.target.id=%s", evt.target.id)
      })

      $(videoId).on('timeupdate', function onTimeUpdate(evt){
        // By observation Chrome seems to fire off every quarter second.
        //
        //console.log("onTimeUpdate: evt.target.id=%s; videoEl.currentTime=%f;"
        //           , evt.target.id, videoEl.currentTime)
        //history.pushState(stateObj, "page 2", "bar.html");
        positionRngEl.value = evt.target.currentTime
        positionTimEl.value = Math.floor(evt.target.currentTime)

      })

      $(videoId).on('pause', function onPause(evt){
        console.log("onPause: evt.target.id=%s", evt.target.id)
      })

      $(videoId).on('ended', function onEnded(evt){
        console.log("onEnded: evt.target.id=%s", evt.target.id)

        var play_btn = $(playBtnId)
        if (play_btn.hasClass('playing')) {
          play_btn.removeClass('playing')
          play_btn.addClass('paused')
        }

      })

      $(fullscreenId).click(function onFullscreenBtnClick(evt) {
        var videoEl = $(videoId)[0]
        //var videoEl = $(canvasId)[0]

        //console.log("videoEl.fullscreenElement =", videoEl.fullscreenElement )
        console.log("PLAY_MAIN.isFullscreen =", PLAY_MAIN.isFullscreen)
        
        if(!PLAY_MAIN.isFullscreen){
          console.log("Trying to request fullscreen videoEl")
          if (videoEl.requestFullscreen) {
            console.log("HAS videoEl.requestFullscreen")
            videoEl.requestFullscreen();
          } 
          else if (videoEl.mozRequestFullScreen) {
            console.log("HAS videoEl.mozRequestFullscreen")
            videoEl.mozRequestFullScreen(); // Firefox
          } 
          else if (videoEl.webkitRequestFullscreen) {
            console.log("HAS videoEl.webkitRequestFullscreen")
            videoEl.webkitRequestFullscreen(); // Chrome and Safari
          }
          PLAY_MAIN.isFullscreen=true;

          //fullscreen_btn.classList.remove('icon-fullscreen-alt');
          //fullscreen_btn.classList.add('icon-fullscreen-exit-alt');
        }
        else{
          console.log("Trying to cancel fullscreen document")
          if(document.cancelFullScreen) {
            console.log("HAS document.cancelFullScreen")
            document.cancelFullScreen();
          } 
          else if(document.mozCancelFullScreen) {
            console.log("HAS document.mozCancelFullScreen")
            document.mozCancelFullScreen();
          } 
          else if(document.webkitCancelFullScreen) {
            console.log("HAS document.webkitCancelFullScreen")
            document.webkitCancelFullScreen();
          }
          PLAY_MAIN.isFullscreen=false;
          //fullscreen_btn.classList.add('icon-fullscreen-alt');
          //fullscreen_btn.classList.remove('icon-fullscreen-exit-alt');
        }

      })

      $(playBtnId).click(function onPlayBtnClick(evt) {
        var playBtn = $(playBtnId)
          , playSym = $(playSymId)[0]
          , playTxt = $(playTxtId)[0]
          , videoEl = $(videoId)[0]
          , controlsEl = $(controlsId)[0]

        console.log("onPlayBtnClick: videoEl.paused=%o", videoEl.paused)
        if (videoEl.paused) {
          console.log("onPlayBtnClick: calling videoEl.play()")
          videoEl.play()

          playSym.innerHTML = "&#xf04c"
          playTxt.innerHTML = "PAUSE"

          playBtn.removeClass('paused')
          playBtn.addClass('playing')

          controlsEl.display = "none"
        }
        else {
          console.log("onPlayBtnClick: calling videoEl.pause()")
          videoEl.pause()

          playSym.innerHTML = "&#xf04b"
          playTxt.innerHTML = "PLAY"

          playBtn.removeClass('playing')
          playBtn.addClass('paused')

          controlsEl.display = "block"
        }
      });

      $(skipBtnId).click(function(evt){
        console.log("%s clicked", skipBtnId)

        videoEl.currentTime += skipSec
      })

      $(backBtnId).click(function(evt){
        console.log("%s clicked", backBtnId)

        //'seeked' and 'timeupdate' events can handle updating the canvasEl
        videoEl.currentTime -= backSec
      })

      $(reloadBtnId).click(function(evnt){
        console.log("%s clicked", reloadBtnId)
        var href = window.location.href

        //href += '&t=' + videoEl.currentTime

        console.log("reloadBtn clicked: href = %s", href )

        //if (! href.search(/\breload=1\b/) ) href = href+"&reload=1"
        if (href.search(/&t=\d+\.\d+/)) {
          console.log("reloadBtn clicked: videoEl.currentTime=%f;", videoEl.currentTime)
          var replStr = '&t='+videoEl.currentTime
          console.log("reloadBtn clicked: replStr = \"%s\"", replStr)
          href = href.replace(/&t=\d+(\.\d+)?/, replStr)

          console.log("reloadBtn clicked: NEW href = %s", href )

        }

        window.location.href = href
       })

      $(volumeSymId).click(function onClickVolumeSym(){
        console.log("onClickVolumeSym: videoEl.muted=%o;", videoEl.muted)
        if (videoEl.muted) {
          videoEl.muted = false
          volumeSymEl.innerHTML = "&#xf028;" //fa-volume-up
        }
        else {
          videoEl.muted = true
          volumeSymEl.innerHTML = "&#xf026;" //fa-volume-off
        }
      })

      $(volumeRngId).on('input', function onInputVolume(evt){
        //console.log("onInputVolume: evt = ", evt)
        console.log("onInputVolume: evt.target.valueAsNumber=%o;"
                   , evt.target.valueAsNumber)
        videoEl.volume = evt.target.valueAsNumber/100
      })
      $(volumeRngId).on('change', function onChangeVolume(evt){
        console.log("onChangeVolume: evt = ", evt)
      })

      $(positionTimId).on('input', function onInputPosition(evt){
        //console.log("onInputTim: evt = ", evt)
        console.log("onInputTim: evt.target.valueAsNumber = %f;"
                   , evt.target.valueAsNumber)

        // NOTE: positionTimEl.value & positionRngEl.value are strings
        if (positionRngEl.value != positionTimEl.value)
          positionRngEl.value = positionTimEl.value

        // NOTE: videoEl.currentTime isa double & positionTimEl.value isa string
        var delta = Math.abs(videoEl.currentTime - positionTimEl.valueAsNumber)
        if (delta > 0.001) {//50fps is 20ms is 0.002sec
          //console.log("onInputPosition: videoEl.currentTime=%f;", videoEl.currentTime)
          //console.log("onInputPosition: positionTimEl.valueAsNumer=%f;", positionTimEl.valueAsNumber)
          //console.log("onInputPosition: delta=%f;", delta)
          //console.log("onInputPosition: setting videoEl.currentTime = positionTimEl.valueAsNumber")
          videoEl.currentTime = positionTimEl.valueAsNumber
        }
      })

      $(positionRngId).on('input', function onInputPosition(evt){
        //console.log("onInputPosition: evt = ", evt)
        console.log("onInputPosition: evt.target.valueAsNumber = %f;"
                   , evt.target.valueAsNumber)

        // NOTE: positionTimEl.value & positionRngEl.value are strings
        if (positionTimEl.value !== positionRngEl.value)
          positionTimEl.value = evt.target.value

        // NOTE: videoEl.currentTime isa double & positionRngEl.value isa string
        var delta = Math.abs(videoEl.currentTime - positionRngEl.valueAsNumber)
        if (delta > 0.001) {//50fps is 20ms is 0.002sec
          //console.log("onInputPosition: videoEl.currentTime=%f;", videoEl.currentTime)
          //console.log("onInputPosition: positionRngEl.valueAsNumer=%f;", positionRngEl.valueAsNumber)
          //console.log("onInputPosition: delta=%f;", delta)
          //console.log("onInputPosition: setting videoEl.currentTime = positionRngEl.valueAsNumber")
          videoEl.currentTime = positionRngEl.valueAsNumber
        }
      })


      function filesOnly(cfgMap) {
        cfgMap.filter(function (e,i,a) {
          
        })
      }
      
      function loadDirSync(fqdn) {
        if ( fs.existsSync(fqdn) ) {
          return fs.readdirSync(fqdn)
          .map(function(fn){
            return { filename: fn
                   , stat: fs.statSync(fs) }
          })
        }
      }

      function readConfigSync(fqfn) {
        var json_raw
          , json

        try {
          json_raw = fs.readFileSync(fqfn)
          json = JSON.parse(json_raw)
        }
        catch (x) {
          return
        }

        return json
      }
      
    }) //document.addEventListener('DOMContentLoaded', function(){...})
  } //initFn()


})(window)
