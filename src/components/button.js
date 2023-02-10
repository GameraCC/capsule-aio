import React, { useState, useEffect } from 'react'

import './button.scss'

const IconValid = (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="5px" y="5px" viewBox="0 0 128 128">
    <style type="text/css">
        {
            `.st0{fill:#57FF9A;}`
        }
    </style>
    <path class="st0" d="M118,128H10c-5.52,0-10-4.48-10-10V10C0,4.48,4.48,0,10,0h108c5.52,0,10,4.48,10,10v108
        C128,123.52,123.52,128,118,128z M20,108h88V20H20V108z"/>
    <path class="st0" d="M10,10v108h108V10H10z M92.86,53.47L63.37,82.96c-0.4,0.4-0.87,0.7-1.35,0.94c-0.85,0.58-1.83,0.88-2.82,0.88
        c-1.28,0-2.56-0.49-3.54-1.46L41.39,69.05c-1.95-1.95-1.95-5.12,0-7.07c1.95-1.95,5.12-1.95,7.07,0l10.88,10.88L85.79,46.4
        c1.95-1.95,5.12-1.95,7.07,0C94.81,48.35,94.81,51.52,92.86,53.47z"/>
    </svg>
)

const IconValidDisabled = (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg"  x="5px" y="5px" viewBox="0 0 128 128">
    <style type="text/css">
        {
            `.st0{fill:#FF5757;}`
        }
    </style>
    <path class="st0" d="M118,128H10c-5.52,0-10-4.48-10-10V10C0,4.48,4.48,0,10,0h108c5.52,0,10,4.48,10,10v108
        C128,123.52,123.52,128,118,128z M20,108h88V20H20V108z"/>
    <path class="st0" d="M10,10v108h108V10H10z M116.26,109.09l-7.07,7.07L63.82,70.79l-45.05,45.05l-7.07-7.07l45.05-45.05L11.69,18.66
        l7.07-7.07l45.06,45.06l45.38-45.38l7.07,7.07L70.89,63.72L116.26,109.09z"/>
    </svg>
)

const IconInvalidDisabled = (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="5px" y="5px" viewBox="0 0 128 128">
    <style type="text/css">
        {
            `.st0{fill:#313B52;}`
        }
    </style>
    <path class="st0" d="M118,128H10c-5.52,0-10-4.48-10-10V10C0,4.48,4.48,0,10,0h108c5.52,0,10,4.48,10,10v108
        C128,123.52,123.52,128,118,128z M20,108h88V20H20V108z"/>
    <path class="st0" d="M10,10v108h108V10H10z M92.86,53.47L63.37,82.96c-0.4,0.4-0.87,0.7-1.35,0.94c-0.85,0.58-1.83,0.88-2.82,0.88
        c-1.28,0-2.56-0.49-3.54-1.46L41.39,69.05c-1.95-1.95-1.95-5.12,0-7.07c1.95-1.95,5.12-1.95,7.07,0l10.88,10.88L85.79,46.4
        c1.95-1.95,5.12-1.95,7.07,0C94.81,48.35,94.81,51.52,92.86,53.47z"/>
    </svg>
)

export default ({value, onClick}) => {

    const [isDisabled, setIsDisabled] = useState(value !== true)
    const [icon, setIcon] = useState(IconValidDisabled)

    useEffect(() => {
        switch (value) {
            case true:
                setIcon(IconValid)
                setIsDisabled(false)
                break
            case false:
                setIcon(IconValidDisabled)
                setIsDisabled(true)
                break
            case null:
                setIcon(IconInvalidDisabled)
                setIsDisabled(true)
                break
        }

        console.log(value, isDisabled)
    }, [value])

    return (
        <div className="ternaryButton" value={value} onClick={onClick} disabled={isDisabled}>
            {icon}
        </div>
    )
}