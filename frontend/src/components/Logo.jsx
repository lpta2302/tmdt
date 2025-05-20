/* eslint-disable react/prop-types */
import { LogoImage } from "../assets"

function Logo(props) {
    return (
        <div 
            style={
                {
                    height: '80%',
                    width:'228px'
                }
            }
        >
            <img
                width="100%"
                height="100%"
                src={LogoImage}
            />
        </div>

    )
}


export default Logo