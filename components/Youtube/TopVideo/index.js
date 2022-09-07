import React, {Component} from "react";
import styles from "./TopVideo.module.css";



class TopVideo extends Component{
  constructor(props){
    
    super(props);
    this.youtube_id = props.youtube_id;

    this.youtube_url = "https://www.youtube.com/embed/"+ this.youtube_id +"?controls=0&amp;showinfo=0&amp;rel=0&amp;vq=hd1080&amp;autoplay=1&amp;loop=1&amp;mute=1&amp;enablejsapi=1";

   
  
  }

  state={
    show:false,
    showSearch:false,
    search:""
  }

  // to show the labels and labels
  change=()=>{
    this.setState(prevState=>({show:!prevState.show, showSearch:false}))
  }

  //shows the input field
  showsearchHandler=()=>{
    this.setState(prevState=>({showSearch:!prevState.showSearch, show:!prevState.show}))
  }


  eventHandler=(e)=>{
    e.preventDefault()
    this.txt.value=""
  }





  render(){

    

    return(


  <div className={styles.topvideo}>

     {/* input field on top of video  */}
    { this.state.showSearch ? <form onSubmit={this.eventHandler}> <input type="text" placeholder="Enter URL here" className={styles.input}  ref={(el) => (this.txt = el)}/> </form> :null }

      {/* videotop labels and icons */}
      { this.state.show ?
    <div>

    <p>Asianet News Live - Election Result 
      <span className={styles.edit} onClick={this.showsearchHandler}>
      <i className="fa fa-edit"></i>
      </span>
    </p>
    </div>
    :null

      }

      {/* top video */}
  
  {/*}
  <video onClick={this.change} muted autoPlay loop>
      <source src="/camera.mp4"></source>
  </video>
  */}


  <iframe id="youtubevideo" className={styles.youtubeplayer} src={this.youtube_url}  frameBorder="0" allow="autoplay"></iframe>


      {/* pause button */}
  <div style={{display : this.state.show || 
        this.state.showSearch  ? "block" : "none"}} className={styles.pause}>
  <i className="fa fa-pause"></i>
  </div>

   {/* bottom video time adjusting bar */}
  <div style={{display : this.state.show || 
        this.state.showSearch ? "block" : "none"}} className={styles.changeTime}>
          <div className={styles.round}></div>
 
  </div>


  </div>

  
    )
  }
}

export default TopVideo;