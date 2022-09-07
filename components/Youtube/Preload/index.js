import React,{Component} from "react";


//To pre-load images
class Preload extends Component{

    render = () =>{


        return(<>
        
                <div style={{display:"none"}}>
                
                        <img src="/cam-off.png"/>
                        <img src="/cam-on.png"/>
                        <img src="/mic-off.png"/>
                        <img src="/mic-on.png"/>

                </div>

        </>)
    }
}

export default Preload;