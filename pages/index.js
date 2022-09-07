import React, { Component } from 'react';
import styles from "../styles/index.module.css";
import Logo from '../components/logo/logo';
import Head from 'next/head';



class Home extends Component {

  constructor(props) {
    super(props);

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


  }

  loadYoutube = () => {

    let YoutubeInputDom = document.getElementById("youtubeinput");
    let youtube_id = this.youtubeUrlParser(YoutubeInputDom.value);

    //if a valid ID (otherwise same string will return )
    if (youtube_id.search(YoutubeInputDom.value) == -1) {
      window.location = '/play/' + youtube_id;
    }
    else {
      alert('Invalid URL');
    }




  }

  onYoutubeKeyup = (event) => {

    //Only on enter button, change url 
    if (event.keyCode === 13) {
      this.loadYoutube();

    }


  }


  render() {

    return (
      <>

        <Head>

          <title>Volcano - Youtube Co-Watch</title>

        </Head>



        <div className={styles.youtubeInput} >

          <div>
            <input type="text" name="youtubeinput" id="youtubeinput" placeholder="Enter Youtube Video URL Here" onKeyUp={this.onYoutubeKeyup} />
          </div>

          <div>
            <button id="loadyoutube" onClick={this.loadYoutube}>Play YouTube Video</button>
          </div>

        </div>


        <div className={styles.logo}>
          <Logo />
        </div>

      </>)

  }

}

export default Home;