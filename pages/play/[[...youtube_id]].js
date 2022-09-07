import React, { Component, createRef } from 'react';
import Script from 'next/script'
import Image from 'next/image'


import Head from 'next/head';
import TopVideo from '../../components/Youtube/TopVideo';
import Viewers from '../../components/Youtube/Viewers';
import Footer from '../../components/Youtube/Footer';
import styles from "../../styles/youtube.module.css";


import Streamer from '../../components/streamer';
import LiveView from '../../components/Youtube/live-view/live-view';
import Logo from '../../components/Youtube/logo/logo';

import Preload from '../../components/Youtube/Preload';


let Notifier = require('../../helpers/sync/systemCommunication').SystemCommunication;

//For youtue API to load
let YouTubeIframeLoader;

if (typeof window !== 'undefined') {

    YouTubeIframeLoader = require('youtube-iframe');

}


class Youtube extends Component {

    constructor(props) {

        super(props);

        this.youtube_id = props.youtube_id;
        this.room_id = props.room_id;
        this.isHome = false;

        //This never happens as per latest change
        if (this.youtube_id == '') {

            this.youtube_id = 'eJ7ZkQ5TC08'; //Time square live 
        }


        //Set a unique user id for each browser/client
        this.my_uuid = Math.floor(Math.random(1000, 4000) * 1000000);

        this.streamer = createRef();
        this.footer = createRef();

        //The youtube API controller
        this.YoutubePlayer = false;

        //To handle all socket io notification
        this.notifier = new Notifier();

        this.didMount = false;

    }

    state = {


        remoteVideos: [],
        startupDone: false,
        youtubeReady: false,
        youtubeplay: true,
        youtubesound: true,
        youtubeCurrentTime: 0,
        youtubeDuration: 0,
        localStream: false,
        streamerReady: false,



    }

    //Let remove object to change state (for the notifier lib)
    handleState = (remotestate) => {

        this.setState(remotestate);
    }

    static async getInitialProps(ctx, res) {


        let youtube_id = '';
        let room_id = '';

        if (ctx.query.youtube_id !== undefined) {
            youtube_id = ctx.query.youtube_id[0];

            if (ctx.query.youtube_id[1] !== undefined) {
                room_id = ctx.query.youtube_id[1];
            }
            else {
                room_id = Math.floor(Math.random(1000, 99999999) * 100000000);
                ctx.res.writeHead(302, { Location: '/play/' + youtube_id + '/' + room_id });
                ctx.res.end();
            }

        }
        else {
            ctx.res.writeHead(302, { Location: '/youtube/' });
            ctx.res.end();
        }


        return {

            youtube_id: youtube_id,
            room_id: room_id

        }

    }

    //When the streamer is ready
    onStremerConnectSuccess = () => {

        this.setState({ streamerReady: true })

    }

    onIncomingStream = (remoteStream) => {



        //Get unique ID for each stream
        let streamId = remoteStream.getId();

        //Save the stream in video array

        //Create StreamingVideo Compontent which has video and other actions like mute/disable/resize etc
        let ViewersJSX = <Viewers id={streamId} streamObject={remoteStream} />;

        //Copy Current State
        let newRemoteVideos = [...this.state.remoteVideos];

        //Insert New Video with Id
        newRemoteVideos[streamId] = ViewersJSX;


        this.setState({

            remoteVideos: newRemoteVideos

        })

        //Get the dom object of the video element
        let videoDom = document.getElementById(streamId);

        videoDom.innerHTML = '';

        //Set video source as the remote stream
        videoDom.srcObject = remoteStream.stream;

        //When the initial data is loaded, play them.
        videoDom.onloadeddata = () => {


            videoDom.style.display = 'block';

            //If startup window click is trigger (initial click for audio context)
            // if need to start the video without mute, else begin the video with mute. 

            if (this.state.startupDone) {

                videoDom.muted = false;
            }
            else {

                videoDom.muted = true;
            }


            videoDom.play();



        }

    }

    //Stremer Component will trigger this function on local stream
    onLocalStream = (localStream, streamerClient) => {

        //Passthis to the footer component and trigger the insider function
        this.footer.current.onLocalStream(localStream, streamerClient);

        this.setState({ localStream: true });

        // To make the local video draggable and resizable
        $('#myvideocontainer').draggable();
        $('#myvideocontainer').css('cursor', 'move');


        //Manage audio input and control youtube volume.
        setInterval(() => {

            let audio_level = localStream.getAudioLevel();

            //console.log(audio_level*10);

            //If the mic level has certain threshold, auto reduce youtube Video.
            if (audio_level >= 0.70) {
                //this.notifier.reduceYoutubeVolume(this);
            }

            //Show the audio indicator as border/outline
            let videoDom = document.getElementById('myvideo');

            //Show the backgournd of the video based on the input audio level
            if (videoDom != null)
                videoDom.style.outline = (audio_level * 10) + "px solid darkred";



        }, 100);

    }

    onStreamRemoved = (streamId) => {

        //Copy Current State
        let newRemoteVideos = [...this.state.remoteVideos];

        //Remove StreamingVideo component with streamid saved in array
        delete newRemoteVideos[streamId];
        this.setState({

            remoteVideos: newRemoteVideos

        })

    }

    onInitialised = (devices) => {


    }


    onActiveSpeaker = (uid) => {


        //$('video').removeClass(styles.shape);

        //Show the audio indicator as border/outline
        //let videoDom = document.getElementById(uid);
        //videoDom.classList.add(styles.shape);

    }

    //To catch a remote mute
    onPeerMuteAudio = (uid) => {

        let videoDom = document.getElementById(uid);
        videoDom.style.filter = "grayscale(1)";

    }

    //To catch a remute unmute
    onPeerUnmuteAudio = (uid) => {


        let videoDom = document.getElementById(uid);
        videoDom.style.filter = "grayscale(0)";

    }

    componentDidMount() {

        this.initYoutube();

        //Initliase the agoria streamer for getting streams
        this.streamer.current.handleJoin(this.room_id);

        //Initlaise the websocket notifier
        this.notifier.init(this.room_id, this);

        this.didMount = true;



    }

    onYoutubeKeyup = (event) => {

        //Only on enter button, change url 
        if (event.keyCode === 13) {

            let youtubeURLDom = document.getElementById('youtubeurl');
            this.changeYoutubeURL(youtubeURLDom.value);

        }


    }

    //Function to change youtube video
    changeYoutubeURL = (url) => {

        let new_youtube_id = this.youtubeUrlParser(url);
        this.YoutubePlayer.loadVideoById(new_youtube_id);

        //Change Youtube URL ID
        this.youtube_id = new_youtube_id;
        this.notifier.notify('changeURL', { value: new_youtube_id });


    }

    //Function to get youtube Id from full URL
    youtubeUrlParser = (url) => {


        var timeToSec = function (str) {
            var sec = 0;
            if (/h/.test(str)) { sec += parseInt(str.match(/(\d+)h/, '$1')[0], 10) * 60 * 60; }
            if (/m/.test(str)) { sec += parseInt(str.match(/(\d+)m/, '$1')[0], 10) * 60; }
            if (/s/.test(str)) { sec += parseInt(str.match(/(\d+)s/, '$1')[0], 10); }
            return sec;
        };

        var videoId = /^https?\:\/\/(www\.)?youtu\.be/.test(url) ? url.replace(/^https?\:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, "$2") : url.replace(/.*\?v\=([\w-]{11}).*/, "$1");
        var videoStartTime = /[^a-z]t\=/.test(url) ? url.replace(/^.+t\=([\dhms]+).*$/, '$1') : 0;
        var videoStartSeconds = videoStartTime ? timeToSec(videoStartTime) : 0;
        var videoShowRelated = ~~/rel\=1/.test(url);

        return videoId;


    };

    initYoutube = () => {


        YouTubeIframeLoader.load((YT) => {
            this.YoutubePlayer = new YT.Player('youtubevideo',

                {
                    events: {

                        'onReady': () => {


                            //Indicate that youtube iframe API is ready
                            this.setState({ youtubeReady: true });

                            window.YT = this.YoutubePlayer;

                            let youtubeDuration = this.YoutubePlayer.getDuration();
                            this.setState({ youtubeDuration: youtubeDuration });


                            //keep medium volume for youtube
                            this.YoutubePlayer.setVolume(60);
                            this.YoutubePlayer.playVideo();

                            //Request to sync with any  other co-player to know the status
                            this.notifier.notify('syncrequest');

                            setInterval(() => {

                                let currentTime = this.YoutubePlayer.getCurrentTime();
                                this.setState({ youtubeCurrentTime: currentTime });

                                let youtubeDuration = this.YoutubePlayer.getDuration();
                                this.setState({ youtubeDuration: youtubeDuration });

                            }, 100);


                        },
                        'onStateChange': () => {


                            let currentTime = this.YoutubePlayer.getCurrentTime();
                            this.setState({ youtubeCurrentTime: currentTime });

                            let youtubeDuration = this.YoutubePlayer.getDuration();
                            this.setState({ youtubeDuration: youtubeDuration });


                        }
                    },

                    playerVars: {
                        rel: 0, showinfo: 0, ecver: 2
                    }

                });


        });

    }

    SeekBarOninput = (e) => {

        let percentage_progress = e.target.value;
        let seekValue = (this.state.youtubeDuration * percentage_progress) / 100;
        this.YoutubePlayer.seekTo(seekValue);
        this.notifier.notify('seek', { value: seekValue });

    }

    unMuteYoutube = () => {

        this.YoutubePlayer.unMute();
        this.setState({ youtubesound: true });
        this.notifier.notify('unmute');



    }

    muteYoutube = () => {

        this.YoutubePlayer.mute();
        this.setState({ youtubesound: false });
        this.notifier.notify('mute');



    }

    pauseYoutube = () => {

        this.YoutubePlayer.pauseVideo();
        this.setState({ youtubeplay: false });
        this.notifier.notify('pause', { currentTime: this.YoutubePlayer.getCurrentTime() });


    }

    playYoutube = () => {

        this.YoutubePlayer.playVideo();
        this.setState({ youtubeplay: true });
        this.notifier.notify('play');

    }

    seek10Backward = () => {

        let seekValue = this.YoutubePlayer.getCurrentTime() - 10
        this.YoutubePlayer.seekTo(seekValue);
        this.notifier.notify('seek', { value: seekValue });


    }

    seek10Forward = () => {

        let seekValue = this.YoutubePlayer.getCurrentTime() + 10
        this.YoutubePlayer.seekTo(seekValue);
        this.notifier.notify('seek', { value: seekValue });
    }

    unMuteAllVideos = () => {

        //Give a delay and set unmute all videos, 
        //otherwise without finishing the click event unmute will not work. 
        setTimeout(() => {

            let viewersDom = document.getElementById("viewers");

            let all_videos = viewersDom.getElementsByTagName("video");
            for (let i = 0; i < all_videos.length; i++) {
                all_videos[i].muted = false;
            }

        }, 1000);




    }


    //Function to run on start button press
    startUp = () => {

        //If the youtube input is entered
        let YoutubeInputDom = document.getElementById("youtubeinput");

        if (YoutubeInputDom && YoutubeInputDom !== null) {

            let youtube_id = this.youtubeUrlParser(YoutubeInputDom.value);
            window.location = '/play/' + youtube_id;

        }

        this.setState({ startupDone: true })
        this.unMuteAllVideos();
        this.unMuteYoutube();

        document.getElementsByClassName(styles.startupbox)[0].style.display = 'none';

    }

    copyToClipBoard = () => {

        let linkDom = document.getElementById('sharelink');
        linkDom.select();
        linkDom.setSelectionRange(0, 99999); /* For mobile devices */
        document.execCommand("copy");

    }



    render() {
        return (
            <>

                <Head>

                    <title>Volcano - Living Videos</title>
                    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />


                </Head>

                <Script src="https://code.jquery.com/jquery-1.12.4.js"></Script>
                <Script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></Script>



                <div className={styles.liveView}>
                    <LiveView hideStatistics={true} />
                </div>


                <Streamer

                    channel={this.room_id}
                    uuid={this.my_uuid}
                    onIncomingStream={this.onIncomingStream}
                    onLocalStream={this.onLocalStream}
                    onStreamRemoved={this.onStreamRemoved}
                    onInitialised={this.onInitialised}
                    onActiveSpeaker={this.onActiveSpeaker}
                    onStremerConnectSuccess={this.onStremerConnectSuccess}
                    onPeerMuteAudio={this.onPeerMuteAudio}
                    onPeerUnmuteAudio={this.onPeerUnmuteAudio}
                    watchonlymode={true}
                    ref={this.streamer}

                />

                <TopVideo youtube_id={this.youtube_id} />

                <div className={styles.outerLayer}>

                    <div className={styles.layer}>

                        {this.state.localStream /* If local stream is available, show controls */ &&
                            <>

                                <div className={styles.playercontrols}>

                                    <a href="#" onClick={this.seek10Backward}><Image alt="left" src="/left10.png" /></a>

                                    {this.state.youtubesound &&
                                        <>
                                            <a href="#" onClick={this.muteYoutube}><Image alt="soundon" src="/youtube-sound-on.png" /></a>

                                        </>

                                    }

                                    {!this.state.youtubesound &&
                                        <>
                                            <a href="#" onClick={this.unMuteYoutube}><Image alt="soundoff" src="/youtube-sound-off.png" /></a>
                                        </>

                                    }


                                    {this.state.youtubeplay &&
                                        <>

                                            <a href="#" onClick={this.pauseYoutube} id="youtubepause"><Image alt="pause" src="/pause.png" /></a>

                                        </>

                                    }

                                    {!this.state.youtubeplay &&
                                        <>

                                            <a href="#" onClick={this.playYoutube}><iImage alt="play" src="/play.png" /></a>

                                        </>

                                    }

                                    <a href="#" onClick={this.seek10Forward}><Image alt="right" src="/right10.png" /></a>

                                    <div className={styles.changeURL}>
                                        <input type="text" id="youtubeurl" onKeyUp={this.onYoutubeKeyup} defaultValue={"https://www.youtube.com/watch?v=" + this.youtube_id} />
                                    </div>

                                </div>

                            </>
                        }


                        <div className={styles.viewersgroup} id="viewers">

                            {this.state.remoteVideos}


                        </div>



                    </div>

                </div>

                <div className={styles.logo}>
                    <Logo />
                </div>

                <div className={styles.footer}>

                    {this.state.localStream /* If local stream is available, show controls */ &&

                        <>

                            <div className={styles.slidecontainer}>

                                <input type="range" min="1" max="100" value={(this.state.youtubeCurrentTime / this.state.youtubeDuration) * 100} className={styles.slider} id="seekbar" onInput={this.SeekBarOninput} />

                            </div>

                        </>}


                    <Footer streamer={this.streamer} channel={this.room_id} ref={this.footer} socket={this.socket} notifier={this.notifier} YoutubePlayer={this.YoutubePlayer} />

                </div>

                <div className={styles.startupbox}>

                    <div className={styles.startupbox_inner}>

                        <div className={styles.startupbox_container} >


                            <p>HEADPHONES are highly recommended to avoid ECHO.</p>

                            <p><b>Participants:</b> Clicking on GO LIVE will switch on your
                                camera &amp; mic, grant permission when asked. </p>


                            <p>Volcano is best viewed on Desktops &amp;
                                if you are a non-participant accessing from mobile/web,
                                just ask your showrunner for the Youtube, Facebook,
                                or Instagram live stream URL of the same event to watch
                                effortlessly on mobile/web.  </p>



                            <p><input id="sharelink" value={"http//localhost:3000/youtube/" + this.youtube_id + "/" + this.room_id} onClick={this.copyToClipBoard} /></p>


                            {this.state.youtubeReady && this.didMount && this.state.streamerReady &&

                                <>
                                    <a onClick={this.startUp}>Start Now</a>
                                </>
                            }

                            {(!this.state.youtubeReady || !this.didMount || !this.state.streamerReady) &&

                                <>
                                    <a>Please Wait...</a>
                                </>

                            }

                        </div>

                    </div>

                </div>


                <Preload />


            </>
        )
    }
}
export default Youtube;