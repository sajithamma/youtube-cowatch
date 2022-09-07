import React, { Component } from "react";
import Image from "next/image";


//To pre-load images
class Preload extends Component {

    render = () => {


        return (<>

            <div style={{ display: "none" }}>

                <Image alt="camoff" src="/cam-off.png" />
                <Image alt="camon" src="/cam-on.png" />
                <Image alt="micoff" src="/mic-off.png" />
                <Image alt="micon" src="/mic-on.png" />

            </div>

        </>)
    }
}

export default Preload;