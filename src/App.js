import React, { Component } from 'react';
import Navigation from './components/navigation/navigation';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import ParticlesBg from 'particles-bg'; // https://www.npmjs.com/package/particles-bg
import './App.css';


   ///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////

    const returnClarifaiRequestOptions = (imageURL) => {
      // Your PAT (Personal Access Token) can be found in the Account's Security section
      const PAT = 'e73f8b1fbe624c0ba16a077feea6bd71';
      // Specify the correct user_id/app_id pairings
      // Since you're making inferences outside your app's scope
      const USER_ID = 'philliptaylor';       
      const APP_ID = 'my-first-application-d1st4j';
      // Change these to whatever model and image URL you want to use
      const MODEL_ID = 'face-detection';
      // const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';    
      const IMAGE_URL = imageURL; 
      
      const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
      });

      const requestOptions = {
          mode: 'cors',
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Authorization': 'Key ' + PAT,
          },
          body: raw
      };

      return requestOptions;
    }

 
 class App extends Component {
  constructor() {
    super();
    this.state = {
      input:'',
      imageURL: '',
      box: {},
    }
  }

  calculateFaceLocation =  (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage')
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    console.log(data.outputs[0].data.regions[0].region_info.bounding_box)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow:  height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
    // console.log('here is the box: ', box)
  }

  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({input: event.target.value})
  }

  onButtonSubmit= (event) =>  {
    console.log('click')
    this.setState({imageURL: this.state.input})
   
      // app.models.predict('face-detection', this.state.input)
          
      // fetch("/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
      // .then(response => response.json())
      //   .then(result => console.log(result))
      //   .catch(error => console.log('error', error));
      //result.outputs[0].data.regions[0].region_info.bounding_box

      fetch("/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
      .then(response => response.json())
      .then(result => this.displayFaceBox(this.calculateFaceLocation(result)))
      .catch(err => console.log(err))
        
      
    }
  

  render() {
    return (
      <div className="App">
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onButtonSubmit}
        />

        <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/>
        
        <ParticlesBg type="circles" bg={true} />
      </div>
    );
  }
}

export default App;
