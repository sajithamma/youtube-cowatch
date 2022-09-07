
import io from 'socket.io-client';

class SystemCommunication
{
  
    notify = (action, params) => {

        let message = {room: this.room, action: action, params: params }
        message = JSON.stringify(message);
        this.socket.emit("system", message);

    }

    init = (room, caller) => {

     
        this.socket = io();
        this.room= room;

        this.resetTimer = false;
        this.downTimer = false;
        this.upTimers = [];
        

        //Sync currentTime + Status of the first time when youtube load with others
        this.firstTimeSync = true;
        
        //Auto Volumn up down mutex lock
        this.volumeLock = false;
        
        this.socket.on("system", (incomingmessage) => {
        
            incomingmessage = JSON.parse(incomingmessage);

            console.log(incomingmessage);

            let action = incomingmessage.action;

            switch(action){

                case 'pause':   console.log('pause received');
                                caller.YoutubePlayer.pauseVideo(); 
                                caller.YoutubePlayer.seekTo(incomingmessage.params.currentTime); 
                                caller.handleState({youtubeplay: false});    
                                break;

                case 'play':    console.log('play received');
                                caller.YoutubePlayer.playVideo();    
                                caller.handleState({youtubeplay: true}); 
                                break;  

                case 'mute':    console.log('mute received');
                                caller.YoutubePlayer.mute();   
                                caller.handleState({youtubesound: false});  
                                break;    

                case 'unmute':  console.log('unmute received');
                                caller.YoutubePlayer.unMute();  
                                caller.handleState({youtubesound: true});    
                                break;    

                case 'chat':    console.log('chat received');
                                caller.handleState({popup:true, layer:false, msg:incomingmessage.params.text});
                                
                                setTimeout(()=>{
      
                                        caller.handleState({popup:false})
                                    
                                },5000)

                                break;   

                case 'emoji':   console.log(caller);
                                caller.handleState({emojiAnimation:true, emojiShow:false, image:incomingmessage.params.image});
                                
                                setTimeout(()=>{
      
                                        caller.handleState({emojiAnimation:false})
                                    
                                },3000)

                                break;   

                case 'seek':    console.log('seek received');
                                caller.YoutubePlayer.seekTo(incomingmessage.params.value);     
                                break;   
                                
                case 'autoreduce':    
                                
                                console.log('autoreduce received');

                                //avoid notify loop, set notify false
                                this.reduceYoutubeVolume(caller, false);
                                break;  

                case 'syncrequest':   

                                let currenttime = caller.YoutubePlayer.getCurrentTime();
                                this.notify('syncresponse', {youtube_id: caller.youtube_id, currenttime: currenttime });
                                
                                break;    

                case 'syncresponse':   

                                if(this.firstTimeSync)
                                {
                                    let currenttime = incomingmessage.params.currenttime;
                                    caller.youtube_id  = incomingmessage.params.youtube_id;
                                    caller.YoutubePlayer.loadVideoById({videoId: caller.youtube_id, startSeconds: currenttime});  

                                    this.firstTimeSync = false;
                                }

                                break;    
                                
                case 'changeURL':    
                                
                                console.log('URL Change Received');
                                caller.youtube_id  = incomingmessage.params.value;
                                caller.YoutubePlayer.loadVideoById(incomingmessage.params.value);  
                                break; 
                                
                case 'mastermute':
                                
                                //Streamer my casue error if it is not initialised, so do this in try cathc
                                try{
                                   
                                     caller.streamer.current.localStream.muteAudio();
                                     caller.footer.current.handleState({disableLocalAudio:true});

                                }
                                catch(e){}

                                break;

                case 'currentUser': 
                              
                                //To set current user of the artist.
                                caller.setCurrentUser(incomingmessage.params.streamId)
                                break;  

                case 'terminateStream': 
                              
                                //If thie is meant for me
                                if(caller.my_uuid == incomingmessage.params.streamId )   
                                {

                
                                    caller.streamer.current.localStream.stop();
                                    caller.streamer.current.localStream.close();
                                    caller.streamer.current.streamerClient.unpublish(caller.streamer.current.localStream);

                                    caller.you.current.handleState({ iAlso: false });

                                } 
                               
                                break;                 

                                                
                case 'adminmute': 
                                

                                //Mute all execept the current user active
                                if(caller.currentUser !=  caller.my_uuid)
                                {
                                    //Streamer my casue error if it is not initialised, so do this in try cathc
    
                                    try{
                                    
                                            caller.streamer.current.localStream.muteAudio();
                                            caller.you.current.handleState({disableLocalAudio:true});

                                            let videoDom = document.getElementById("youid");

                                            videoDom.style.filter = "grayscale(1)";
        
                                    }
                                    catch(e){}
                                }
                              

                                break;                 

            } 
        

            })

    }

    reduceYoutubeVolume = (caller,  notify=true) => {

        console.log('High Volume Detected');

        //Clear reset after sometime timer
        clearTimeout(this.resetTimer );

        //reset volumn lock;
        this.volumeLock = false;

        //Clear all uptimers
        for(let i=0; i < this.upTimers.length; i++)
        {
             clearTimeout( this.upTimers[i]); 

        }
       
        //Clear all timers
        this.upTimers = [];

        //caller.YoutubePlayer.setVolume(5);

        this.gradualVolumeDown(caller, 3);

        if(notify)
        this.notify('autoreduce');

        this.resetTimer  = setTimeout(()=> {

            //caller.YoutubePlayer.setVolume(100); 

            this.gradualVolumeUp(caller, 60); 


        }, 5000);



    }

    gradualVolumeDown = (caller, leastvolume) => {

            
            //IF up is already running, dont do anything
            if(this.volumeLock !== false &&  this.volumeLock == "UP")
            {
                return;
            }

            //set the lock for down
            this.volumeLock = 'DOWN';


            let currentVolume = caller.YoutubePlayer.getVolume();
            currentVolume = currentVolume - 5;



            if(currentVolume <=  leastvolume)
            {
                //Clear the lock for down
                this.volumeLock = false;
                return;
            }

            caller.YoutubePlayer.setVolume(currentVolume);

            this.downTimer  = setTimeout(()=> {

                this.gradualVolumeDown(caller, leastvolume );

            }, 50)
    }

    gradualVolumeUp = (caller, topvolume) => {

        
         //IF down lock is already running, do nothing
         if(this.volumeLock !== false &&  this.volumeLock == "DOWN"){
                return;
         }

        //Set the lock for up
        this.volumeLock = 'UP';


        let currentVolume = caller.YoutubePlayer.getVolume();
        currentVolume = currentVolume + 5;


        if(currentVolume >=  topvolume)
        {
                //Clear the lock
                this.volumeLock = false;
                return;
        }

        caller.YoutubePlayer.setVolume(currentVolume);

        this.upTimers[this.upTimers.length]  =  setTimeout(()=> {

                this.gradualVolumeUp(caller, topvolume );

        }, 50)

    }

}



module.exports = {
    
    SystemCommunication:  SystemCommunication
}