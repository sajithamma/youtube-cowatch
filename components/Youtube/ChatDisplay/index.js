import React,{Component} from "react";
import styles from "./ChatDisplay.module.css";
class ChatDisplay extends Component{

  state={
    message:"",
  }

  eventHandler=(e)=>{
        var text = e.target.value
        this.setState({message:text})
  }
  render(){
    return(
      <>
     <div className={styles.chat}>
       <form onSubmit={this.props.messagePopupHandler}>
         <input placeholder="Type something to send a flash chat...|" onChange={this.eventHandler} id="input" maxLength="250" autoFocus/>
         <input type="submit" className={styles.submit}/>
        </form>
        <a  onClick={this.props.closeHandler} href="#close">X</a>
     </div>
     </>
    )
  }
}

export default ChatDisplay;