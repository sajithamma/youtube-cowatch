import React, {Component} from 'react';
import style from './live.module.css';
import io from 'socket.io-client';


class liveView extends Component{
    
    constructor(props)
    {
        super(props);
        
        this.hideStatistics = props.hideStatistics ||  false;
        
        this.state = {

            livecount: ""
        }

    }

    
  componentDidMount() {

    //url parse to assign city name to pages
    var root = window.document.location.href
    //socket connection client side

    var socket = io()

    socket.emit("register", (location.pathname))

    socket.on("livecount", (value) => {
      
        this.setState({ livecount: value })

    })
  }



    render(){ 
        
        return(
            <>

                <div className={style.live}>
                    <div className={style.line}>
                        <div className={style.red}>
                        <i className="fa fa-eye"></i>
                            <h4>LIVE</h4>
                        </div>
                        
                        <p>{ this.state.livecount}</p>
                    </div>


                    {!this.hideStatistics && 
                    
                    <>  

                    <div className={style.image}>
                    <img src="/live.jpg" alt="image" className={style.graph}/>
                    </div>
                    <h5>{Math.imul(8.17, this.state.livecount)}MB</h5>
                    <small>airBytes</small>

                    </>
                    }


                    
                </div>
                </> 
            )
        }
}

export default liveView;