import React from 'react';

export const Navbar = ({isShow}) => {
    return(
        <div >
            {
                isShow && <div className="fixed-top-wrap"></div>
            }
        </div>
    )
}