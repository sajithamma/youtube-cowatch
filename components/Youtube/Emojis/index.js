import React,{Component} from "react";
import styles from "./Emoji.module.css";
class Emoji extends Component{

state={
array:[
  {
    id:1,
    image:"/em1.png"
  },
  {
    id:2,
    image:"/em2.png"
  },
  {
    id:3,
    image:"/em3.png"
  },
  {
    id:4,
    image:"/em4.png"
  },
  {
    id:5,
    image:"/em5.png"
  },
  {
    id:6,
    image:"/em6.png"
  },
  {
    id:7,
    image:"/em7.png"
  },
  {
    id:8,
    image:"/em8.png"
  },
   {
    id:9,
    image:"/em9.png"
  }
]
}

  render(){
    return(
      <>
     <div className={styles.emoji}>
       
        <a className={styles.close}  href="#close"  onClick={this.props.closeEmojiHandler}><img src="/close.png"/></a>
    
       <ul>
       {this.state.array.map(img=>(
         <li className={styles.singleEmoji} key={img.id}>
         <img src={img.image} onClick={ ()=>this.props.emojiClick(img.image)}/>
         </li>
       ))}
        
     </ul>
     </div>
     </>
    )
  }
}

export default Emoji;