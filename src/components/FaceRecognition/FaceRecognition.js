import React from 'react';
import './FaceRecognition.css';
// import './ImageLinkForm.css'

// destructure passed value from props instead of having to put
// props.onInputChange

const FaceRecognition = ({ imageURL, box }) => { 
  return (
    <div className='center'>
      <div className="absolute mt2">
        <img id='inputImage' alt='' src={imageURL} width='500px' height='auto' />
        <div className='bounding-box' style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left:  box.leftCol }}></div>
      </div>
      
    </div>
  );
};

export default FaceRecognition;
