import React from 'react';
import _get from 'lodash.get';

export default ({backgroundUrl, width, height}) => {
    const defaultProps = {

    }
    return (
        <div {...defaultProps} className="hexagon">
            <svg width="100%"
                 height="300" xlinkHref="http://www.w3.org/1999/xlink">
                <defs>
                    <pattern id="image-bg" x="0" y="0" height="300" width="300" patternUnits="userSpaceOnUse">
                    <image width="300" height="300" href="http://placekitten.com/306/306"></image>
                    </pattern>
                </defs>
                <polygon className="hex"
                        points="300,150 225,280 75,280 0,150 75,20 225,20" fill="url('#image-bg')">
                </polygon>
            </svg>
        </div>
    );
}
