import { Component } from 'react';
import {rtc, options} from './streamer.config.js';


let AgoraRTC;
//NextJS doesnot support window object in the build time.
if (typeof window !== 'undefined') {
    
     AgoraRTC = require('agora-rtc-sdk');
}



class Streamer extends Component
{
    constructor(props)
    {
        super(props);

        this.channel = props.channel || 'mydemochannel';
        this.mode = props.mode || 'live';
        this.codec = props.codec || 'vp8';

        this.watchonlymode = props.watchonlymode || false;

        //Callback when the agora is initialised
        this.onInitialised = props.onInitialised || function(){};

        //Callback when the agora is initialised
        this.onStremerConnectSuccess = props.onStremerConnectSuccess || function(){};

        //Callback function when new incoming streams added
        this.onIncomingStream = props.onIncomingStream || false;

        //Callback function to handle local stream (self cam/vidoe/audio etc)
        this.onLocalStream = props.onLocalStream || false;

        //Callback to handle when a stream is removed
        this.onStreamRemoved = props.onStreamRemoved || false;

        //Callback to get active speaker
        this.onActiveSpeaker = props.onActiveSpeaker || false;

        //Callback to get active speaker
        this.onPeerUnmuteAudio = props.onPeerUnmuteAudio || false;

        this.onPeerMuteAudio = props.onPeerMuteAudio || false;


        this.uuid = props.uuid ||  '8'+ Math.floor(Math.random(1000,4000)* 1000000);   
        
        this.localStream = false;

        this.diabledAutoPublish = props.diabledAutoPublish || false;

        this.screenShareStream = false;

       
        
    }

    
   
    getVideoDevices()
    {
        
        let VideoDevices = [];
        AgoraRTC.getDevices((devices) => {

            this.onInitialised(devices);
           
        });

    };



    handleJoin = (channelinput=false) =>  {
        

        
        if(channelinput !== false && channelinput != ''){

            this.channel = channelinput;
        }

        //Check whether the browswer has WEBRTC support
        let systemStatus = AgoraRTC.checkSystemRequirements();
        if(systemStatus === false)
        {
            alert('Live streaming is not supported by your browser!');
            return false;
        }
        
        /* Initiliase the streamerClient to Agora */
        this.streamerClient =  AgoraRTC.createClient({
                
                                mode: this.mode,
                                codec: this.codec
                            
                            });

        //Set log level 0 DEBUG, 1-INFO, 2-WARNING  3- ERROR, 4-NONE
        //AgoraRTC.Logger.setLogLevel(3);                  

        //Watch only mode on, new outgoing streaming                        
        if(this.watchonlymode)
        {

            this.streamerClient.setClientRole("audience", function(e) {
                if (!e) {
                  console.log("set Audience success");
                } else {
                  console.log("set Audience error", e);
                }
              });

        }                    

        this.initializeListerners();   

        this.streamerClient.init(
                                
                                options.appId,  
                                this.handleClientInitSuccess, 
                                this.handleFail
                                
                                );  

        

    }


   /*
   Function to handle changing an audien to host
   */
   handleChangeToHost = (custom_uuid = this.uuid) => {



        this.streamerClient.setClientRole("host", (e) => {
                if (!e) {
         

                //Disable watchonly mode
                this.watchonlymode = false;


                this.handleClientConnectSuccess(custom_uuid);


                } else {
                  console.log("setHost error", e);
                }
              });

    }

    handleClientInitSuccess = () => {

         console.log("<TESTING>");
         console.log(this.uuid);
         
         
         this.streamerClient.join(
                                    options.token, 
                                    this.channel,
                                    this.uuid,
                                    this.handleClientConnectSuccess,
                                    this.handleFail

                                );
    }


    handleClientConnectSuccess = (bounced_uuid) => {


            console.log(this.streamerClient); 

            
            this.getVideoDevices();

            //Set multiple qulaity streaming based on network
            this.streamerClient.enableDualStream();


            // Triggers the "volume-indicator" callback event every two seconds.
            //this.streamerClient.enableAudioVolumeIndicator(); 
            
          
            
            //Callback if registered
            this.onStremerConnectSuccess();

            //No need to connect local stream if watchonly mode is on
            if(this.watchonlymode)
            {
                
                return false;
            }

            //@Todo, check if local stream is needed or not.
            this.uuid = bounced_uuid;


            this.localStream = AgoraRTC.createStream({


                                streamID: this.uuid,
                                audio: true,
                                video: true,
                                screen: false,
                               
                
                
                            });

            this.localStream.init(this.handleLocalStreamSuccess, this.handleFail);  

                         



    }

    /** Success Callback when a local stream is ready */
    handleLocalStreamSuccess = () => {

        
        //Set HD quality for local stream
        this.localStream.setVideoProfile("720p_3");


        //If there is a callback function defined
        if(this.onLocalStream !== false){

            //Trigger the callback function to handle the stream
            this.onLocalStream(this.localStream, this.streamerClient);
        }
        else{

            console.log("No local stream CALLBACK is defined as props.");
        }


        //If auto publish the local stream to the channel is set.
        if(this.diabledAutoPublish === false){

            //publish the local stream to channel for broadcasting
            this.publishLocalStream();


        }
        

    }

    publishLocalStream = () => {

        this.streamerClient.publish(this.localStream, this.handleFail);

    }
    

    /** Private function to initlaise Listers */
    initializeListerners = () => {
        
        //A new stream is added on the channel. It can be video/audio/screen
        this.streamerClient.on("stream-added", (evt) => {
   
            
                let stream = evt.stream;
                let streamID = String(stream.getId());

                    //A new stream is added to the channel, so lets request to subscribe the stream
                this.streamerClient.subscribe(stream, this.handleFail);

        });

        // A new stream added is now subscribed, lets show its content.
        this.streamerClient.on("stream-subscribed", (evt)=> {


                let stream = evt.stream;
                let streamID = String(stream.getId());

                    //If there is a callback function defined
                if(this.onIncomingStream !== false){

                        //Trigger the callback function to handle the stream
                        this.onIncomingStream(stream);
                }
                else{
                    console.log("No incoming stream CALLBACK is defined as props.");
                }
            

        })


        // A new stream added is now subscribed, lets show its content.
        this.streamerClient.on("stream-removed", (evt) => {

            this.handleStreamRemoved(evt);
            
        })


         // A new stream added is now subscribed, lets show its content.
        this.streamerClient.on("peer-leave", (evt) => {

            this.handleStreamRemoved(evt)

        })


        //Shwo volumn indicator for all
        this.streamerClient.on("volume-indicator", (evt) =>{
                
            evt.attr.forEach(function(volume, index){
                //console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
            });

        });


        //When some stream mute audio
        this.streamerClient.on("mute-audio", (evt)  => {
            
            var uid = evt.uid;
            console.log("mute audio: " + uid);

            //trigger if the event is registered
            if(this.onPeerMuteAudio)
            {
                this.onPeerMuteAudio(uid);
            }
            
            
          });

        //Trigers when someone umute stream    
        this.streamerClient.on("unmute-audio",  (evt) => {
            
            var uid = evt.uid;
            console.log("unmute audio: " + uid);

            //trigger if the event is registered
            if(this.onPeerUnmuteAudio)
            {
                this.onPeerUnmuteAudio(uid);
            }
            

          }); 
          
        //Triggers when someone mute video  
        this.streamerClient.on("mute-video",  (evt) => {
            var uid = evt.uid;
            console.log("mute video: " + uid);
          }); 
          
        //Triggers when someone unmute video
        this.streamerClient.on("unmute-video",  (evt) =>  {
            var uid = evt.uid;
            console.log("unmute video: " + uid);
          });  

        //Trigger the active speaker 
        this.streamerClient.on("active-speaker", (evt) => {
            var uid = evt.uid;
            
            console.log("update active speaker: client " + uid);

            if(this.onActiveSpeaker !== false )    
            {
                 this.onActiveSpeaker(uid);
            }    

         });  

         //Trigger when a stream type change due to bad network
        this.streamerClient.on("stream-fallback", (evt) =>  {
            var uid = evt.uid;
            var attr = evt.attr; //number indicate what type of change
            console.log("Stream changed " + uid);

         });  

        this.streamerClient.on('network-quality', (stats) => {

            //console.log('downlinkNetworkQuality', stats.downlinkNetworkQuality);
            //console.log('uplinkNetworkQuality', stats.uplinkNetworkQuality);

            /*

            "0": The network quality is unknown.
            "1": The network quality is excellent.
            "2": The network quality is quite good, but the bitrate may be slightly lower than excellent.
            "3": Users can feel the communication slightly impaired.
            "4": Users can communicate only not very smoothly.
            "5": The network is so bad that users can hardly communicate.
            "6": The network is down and users cannot communicate at all.

            */

        }); 


         //Occurs when a remote user of the Native SDK calls enableLocalVideo(true) to enable video capture.
        this.streamerClient.on("enable-local-video", (evt) => {
            var uid = evt.uid;
            
            console.log("Local Video is  enabled " + uid);

         });  


        //Trigger when network quality related exceptions comes
        this.streamerClient.on("exception", (evt) => {
            
            console.log(evt.code, evt.msg, evt.uid);

        });

    }

    //Internal Function
    //handle the stremo remove event on peer-leave or peer-stop streaming. 
    //Trigger callback as passed in the component props
    handleStreamRemoved(evt)
    {

        let stream = evt.stream;
        stream.stop();
        let streamID = String(stream.getId());

            //If there is a callback function defined
        if(this.onStreamRemoved !== false){

                //Trigger the callback function to handle the stream
                this.onStreamRemoved(streamID);
        }
        else{
            console.log("No incoming stream CALLBACK is defined as props.");
        }
    }

    /** General Function to handle all failures */

    handleFail = (err) => {

            console.error("Fail Handler Says: " + err);
    }


    //Go live streaming @test @todo
    startLiveStreaming = () => {

            console.log('Streaming about to start...');
        
            
            // CDN transcoding configurations.
            const LiveTranscoding = {
                    // Width of the video (px). The default value is 640.
                    width: 1920,
                    // Height of the video (px). The default value is 360.
                    height: 1080,
                    // Bitrate of the video (Kbps). The default value is 400.
                    videoBitrate: 4780,
                    // Frame rate of the video (fps). The default value is 15.
                    videoFramerate: 60,
                    audioSampleRate: AgoraRTC.AUDIO_SAMPLE_RATE_48000,
                    audioBitrate: 48,
                    audioChannels: 1,
                    videoGop: 30,
                    // Video codec profile. Choose to set as Baseline (66), Main (77), or High (100). If you set this parameter to other values, Agora adjusts it to the default value of 100.
                    videoCodecProfile: AgoraRTC.VIDEO_CODEC_PROFILE_HIGH,
                    userCount: 1,
                    userConfigExtraInfo: {},
                    backgroundColor: 0x000000,
                 
                    // Set the layout for each user.
                    transcodingUsers: [{
                            x: 0,
                            y: 0,
                            width: 1920,
                            height: 1080,
                            zOrder: 0,
                            alpha: 1.0,
                            // The uid must be identical to the uid used in AgoraRTCClient.join.
                            uid: this.screenShareStream.getId(),
                    }],
                    };

            alert('Streaming about to start...');

            // This is an asynchronous method. Please ensure that the asynchronous operation completes before conducting the next operation.
            this.streamerClient.setLiveTranscoding(LiveTranscoding).then(() => {
                        alert("set live transcoding success");
            });

            // Add a URL to which the host pushes a stream. Set the transcodingEnabled parameter as true to enable the transcoding service. Once transcoding is enabled, you need to set the live transcoding configurations by calling setLiveTranscoding. We do not recommend transcoding in the case of a single host.
            // This is an asynchronous method. Please ensure that the asynchronous operation completes before conducting the next operation.
            this.streamerClient.startLiveStreaming("rtmp://a.rtmp.youtube.com/live2/sx9k-0q86-ees6-eu8g-0g79", true).then(() => {
                     alert("start live streaming success");
            })

                          

    }

    //Share Screen Test/ Todo
    shareScreen = () => {
         
        
        this.streamerClient.setClientRole("host", (e) => {alert(e)});
        
        this.screenShareStream = AgoraRTC.createStream({


                                        audio: false,
                                        video: false,
                                        screen: true,
                                    
                        
                        
                                    });

        this.screenShareStream.init(
            
            ()=>{

                    alert('screen share success');

                    this.streamerClient.publish(this.screenShareStream, ()=> {alert('error in publish ') });

            }, 

            
            ()=>{

                    alert('screen share failure');

            });  
                       

    }


    render()
    { 
        return(
            <>
            </>
        );
    }
}

export default Streamer;
