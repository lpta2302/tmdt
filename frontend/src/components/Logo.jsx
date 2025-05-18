/* eslint-disable react/prop-types */
import { Image } from "@mui/icons-material"
import { Typography } from "@mui/material"
import { LogoImage } from "../assets"

function Logo(props) {
    const { margin, variant, fontSize } = props
    return (
        <div 
            {...props}
            style={
                {
                    height: '80%',
                    width:'300px'
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