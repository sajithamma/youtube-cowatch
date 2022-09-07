import React, { Component } from "react";
import styles from "./footer.module.css";
import ChatDisplay from "../ChatDisplay";
import Emoji from "../Emojis";
import Image from "next/image";



class Footer extends Component {

  constructor(props) {

    super(props)

    this.streamer = props.streamer;

    this.channel = props.channel;

    this.socket = props.socket;

    this.notifier = props.notifier;

    this.chat = React.createRef();

    this.hideSepia = props.hideSepia || false;

  }

  state = {

    chatShow: false,
    emojiShow: false,
    popup: false,
    layer: true,
    msg: "",
    emojiAnimation: false,
    image: "",
    localVideo: false,
    disableLocalVideo: false,
    disableLocalAudio: false,
    sepia: false,



  }

  chatDisplay = () => {

    this.setState({ chatShow: true, layer: true })

  }
  emojiDisplay = () => {

    this.setState({ emojiShow: true })

  }

  handleState = (remotestate) => {

    this.setState(remotestate);
  }

  PopupHandler = (e) => {

    const message = this.chat.current.state.message
    e.preventDefault()

    this.setState({ popup: true, layer: false, msg: message });

    this.notifier.notify("chat", { text: message });


    setTimeout(() => {

      this.setState({ popup: false })

    }, 5000)

  }
  closeLayer = () => {
    this.setState({ layer: false })
  }
  emojiClose = () => {
    this.setState({ emojiShow: false })
  }

  emojiAnimation = (i) => {


    this.setState({ emojiAnimation: true, emojiShow: false, image: i })

    this.notifier.notify("emoji", { image: i });

    setTimeout(() => {
      this.setState({ emojiAnimation: false })
    }, 4000)

  }


  handleJoin() {


    this.streamer.current.handleJoin(this.channel);

  }

  //To mute/disable local camera

  muteLocalVideo = () => {

    this.streamer.current.localStream.muteVideo();
    this.setState({ disableLocalVideo: true })

  }

  //To mute/disable local camera

  unMuteLocalVideo = () => {

    this.streamer.current.localStream.unmuteVideo();
    this.setState({ disableLocalVideo: false })

  }

  muteLocalAudio = () => {

    this.streamer.current.localStream.muteAudio();
    this.setState({ disableLocalAudio: true })

    let videoDom = document.getElementById('myvideo');
    videoDom.style.filter = "grayscale(1)";

  }

  //To mute/disable local camera

  unMuteLocalAudio = () => {

    this.streamer.current.localStream.unmuteAudio();
    this.setState({ disableLocalAudio: false })

    let videoDom = document.getElementById('myvideo');
    videoDom.style.filter = "grayscale(0)";

  }


  handleChangeToHost = (e) => {

    e.preventDefault();
    this.streamer.current.handleChangeToHost();
  }

  leaveChannel = () => {


    this.streamer.current.streamerClient.leave(() => {

      this.streamer.current.localStream.stop();
      this.streamer.current.localStream.close();
      this.streamer.current.streamerClient.unpublish(this.streamer.current.localStream);

      location.reload();


    });

  }

  componentDidMount() {



  }


  //Event Listener on local stream, called from the Streamer Component (below)
  onLocalStream = (localStream, streamerClient) => {

    //Change the ste
    this.setState({ localVideo: true })

    //Get access of the inside video by ID
    let videoDom = document.getElementById('myvideo');

    videoDom.innerHTML = '';
    //Set the video source as stream
    videoDom.srcObject = localStream.stream;

    //When the video is ready with data, start playing it. 
    videoDom.onloadeddata = () => {

      videoDom.play();


    }


  }

  sepiaOff = () => {

    let iFrameDom = document.getElementById("youtubevideo");
    iFrameDom.style.filter = "none";
    this.setState({ sepia: false });

  }


  sepiaOn = () => {

    let iFrameDom = document.getElementById("youtubevideo");
    iFrameDom.style.filter = "sepia(1)";
    this.setState({ sepia: true });

  }

  masterMute = (e) => {

    e.preventDefault();

    this.streamer.current.localStream.muteAudio();
    this.setState({ disableLocalAudio: true })
    this.notifier.notify("mastermute");

    let videoDom = document.getElementById('myvideo');
    videoDom.style.filter = "grayscale(1)";

  }




  render() {

    return (
      <>

        <div className={styles.contain}>


          {this.state.popup ?

            <div className={styles.popupMsg}>

              <p>{this.state.msg}</p>

            </div>

            : null
          }


          <div className={styles.icon}>




            <div className={[styles.iconSet, styles.localControls].join(" ")} id="localcontrols">

              {this.state.localVideo &&

                <>

                  <div id="myvideocontainer">

                    <video muted autoPlay loop id="myvideo" >
                    </video>

                  </div>


                  {!this.state.disableLocalVideo &&
                    <>

                      <div><a onClick={this.muteLocalVideo} href="#cam" title="Turn On Camera"><Image alt="camon" src="/cam-on.png" /></a></div>


                    </>
                  }

                  {this.state.disableLocalVideo &&
                    <>

                      <div><a onClick={this.unMuteLocalVideo} href="#cam" title="Turn Off Camera"><Image alt="camoof" src="/cam-off.png" /></a></div>

                    </>
                  }


                  {!this.state.disableLocalAudio &&

                    <>

                      <div><a href="#" onClick={this.muteLocalAudio} title="Turn On Mic" ><Image alt="micon" src="/mic-on.png" /></a></div>
                    </>
                  }

                  {this.state.disableLocalAudio &&
                    <>

                      <div><a href="#" onClick={this.unMuteLocalAudio} title="Turn Off Mic" ><Image alt="micoff" src="/mic-off.png" /></a></div>

                    </>
                  }


                  <div><a href="#" onClick={this.leaveChannel} title="Leave" ><Image alt="leave" src="/leave.png" /></a></div>

                </>
              }


            </div>




            <div className={styles.iconSet}>


              {this.hideSepia === false && this.state.sepia &&
                <>
                  <div ><a onClick={this.sepiaOff} href="#sepia" ><Image alt="sepiaon" src="/sepiaon.png" /></a></div>
                </>
              }

              {this.hideSepia === false && !this.state.sepia &&
                <>
                  <div ><a onClick={this.sepiaOn} href="#sepia" ><Image alt="sepiaoff" src="/sepiaoff.png" /></a></div>
                </>
              }

              <div ><a onClick={this.chatDisplay} href="#chat" ><Image alt="chat" src="/chat.png" /></a></div>

              <div><a href="#emoji" onClick={this.emojiDisplay}><Image alt="emoji" src="/emoji.png" /></a></div>

            </div>

          </div>
        </div>


        {this.state.chatShow && this.state.layer ? <ChatDisplay messagePopupHandler={this.PopupHandler} ref={this.chat} id="chat" closeHandler={this.closeLayer} /> : null}
        {this.state.emojiShow ? <Emoji emojiClick={(image) => this.emojiAnimation(image)} closeEmojiHandler={this.emojiClose} /> : null}

        {this.state.emojiAnimation ? <div className={styles.emojiAnimdiv}> <Image alt="animation" className={styles.emojiAnimation} src={this.state.image} />
          <Image alt="emoji" className={styles.emojiAnimation2} src={this.state.image} />
          <Image alt="emoji" className={styles.emojiAnimation3} src={this.state.image} />
        </div> : null}



        {!this.state.localVideo &&
          <>
            <div className={styles.goLiveButton}>

              <a href="" onClick={this.handleChangeToHost} >GO LIVE</a>

            </div>
          </>
        }


        {this.state.localVideo &&

          <>
            <div className={styles.goLiveButton}>
              <a title="Mute All Video Cameras" href="" onClick={this.masterMute} className={styles.muteAll} >MUTE ALL</a>
            </div>

          </>
        }



      </>
    )
  }
}

export default Footer;