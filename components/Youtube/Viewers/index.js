import React,{Component} from "react";
import Head from 'next/head';
import styles from "./viewers.module.css";
class Viewers extends Component{


    constructor(props)
    {
        super(props);
        this.videoId= props.id;
        this.streamObject = props.streamObject;
    }

    
    state={
        
        show:false,
        streamVideo: true,
        streamAudio: true
    }

    sidebarHandler=()=>{
        this.setState(prevState=>({show:!prevState.show}))
    }

    componentDidMount()
    {

       $('.'+ styles.main).draggable();
       $('.'+ styles.main).css('cursor', 'move');
       $('.'+ styles.videoblock).resizable();


        //Manage audio input and control youtube volume.
        setInterval(()=>{

            let audio_level = this.streamObject.getAudioLevel();

            //Show the audio indicator as border/outline
            let videoDom = document.getElementById(this.videoId);
            
            if(videoDom != null ) 
            {
                if(audio_level > .4)
                {
                    videoDom.parentElement.style.border  =  (audio_level*3) + "px dotted green";
                }
                else{

                    videoDom.parentElement.style.border  = "0px dotted green";
                }
                
            } 


        }, 100);

    }

     //Stop streaming video
    disableVideoStream = () => {

        this.streamObject.muteVideo();
        this.setState({streamVideo: false});
    }

      //Stop streaming video
    enableVideoStream = () => {

        this.streamObject.unmuteVideo();
        this.setState({streamVideo: true});
    }
    
      //Mute the stream to channel
    disableAudioStream = ()=> {

        this.streamObject.muteAudio();
        this.setState({streamAudio: false});
        let vid = document.getElementById(this.videoId);
        vid.muted = true;

    }

     //Mute the stream to channel
    enableAudioStream = () => {

        this.streamObject.unmuteAudio();
        this.setState({streamAudio: true});

        let vid = document.getElementById(this.videoId);
        vid.muted = false;
    }

    render(){

    return(

    <> 
    
   

    <div className={styles.main}>
      <ul>
          <li className={styles.viewers}>

            <div className={styles.videoblock}>
              
              <video onClick={this.sidebarHandler} muted autoPlay loop id={this.videoId} className={styles.shape} >

              </video>


            <div className={styles.sidebar} style={{display : this.state.show ? "block" : "none"}}>

                {this.state.streamVideo && 
                <> 
                        <div className={styles.icons}>
                            <a href="#" onClick={this.disableVideoStream} ><img src="/view-on.png"/></a>
                        </div>
                </>
                }

                {!this.state.streamVideo && 
                <> 
                        <div className={styles.icons}>
                            <a href="#" onClick={this.enableVideoStream}><img src="/view-off.png"/></a>
                        </div>
                </>
                }

                {this.state.streamAudio && 
                <> 
                        <div className={styles.icons}>
                            <a href="#" onClick={this.disableAudioStream} ><img src="/speaker-on.png"/></a>
                        </div>
                </>
                }

                {!this.state.streamAudio && 
                <> 
                        <div className={styles.icons}>
                            <a href="#" onClick={this.enableAudioStream} ><img src="/speaker-off.png"/></a>
                        </div>
                </>
                }

                
             </div>
            
            </div>  

           
                <p></p>
          </li>
      </ul>

  </div>
  </>
        )
    }
}

export default Viewers;