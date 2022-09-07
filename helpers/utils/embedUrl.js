
import SocialURLParser from "js-video-url-parser";


//Generate proper url for the embed page to render with room id
const generateEmbedUrl=(incomingURL)=>{
    

        //Geenrate a random room id for the agora channee
        let room_id = Math.floor(Math.random(1000,99999999)* 100000000);

        //Redirect to embed page with room id and URL
        let redirectURL = FormatURL(incomingURL, room_id)

        return redirectURL;

   


}

//Write code to retrieve 
/*
        1. YouTube
        2. Figma 

*/
const FormatURL = (incomingURL, room_id) =>
{
    
    //if it is a youtube URL, redirect to youtube co-watch page
    if(incomingURL.search('youtube.com') != -1)
    {
        
        let parsedObject = SocialURLParser.parse(incomingURL);

        
        //If we get the id @todo proper checking (if valid ID found)
        if( parsedObject !== undefined ){
            
            let video_id = parsedObject.id;
            return ('/youtube/' + video_id + '/' + room_id);
        }
        else
        {
            //redirect to page where one can enter youtube url
            return ('/youtube/home');
        }
        
    }
    //if it is a figma url
    else if(incomingURL.search('figma.com') != -1)
    {

        //Use figma embed URL instead, rewrite the incoming URL with figma embed
        incomingURL = "https://www.figma.com/embed?embed_host=share&url=" + encodeURIComponent(incomingURL);

        
    }
    else if (incomingURL.search('twitch.tv') != -1)
    {
            let parsedObject = SocialURLParser.parse(incomingURL);
            let channel = parsedObject.channel;

            incomingURL = "https://player.twitch.tv/?channel="+ channel +"&parent=volcano.live"

    }

    else if (incomingURL.search('vimeo.com') != -1)
    {
            let parsedObject = SocialURLParser.parse(incomingURL);
            let id = parsedObject.id;

            incomingURL = "https://player.vimeo.com/video/" + id;

    }

    
   


    return  ('/embed/' +  room_id + '/' + encodeURIComponent(incomingURL));
}


module.exports= generateEmbedUrl;