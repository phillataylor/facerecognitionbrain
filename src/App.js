import React, { Component } from 'react';
import Navigation from './components/navigation/navigation';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import ParticlesBg from 'particles-bg'; // https://www.npmjs.com/package/particles-bg
import './App.css';
// import { findAllByDisplayValue } from '@testing-library/react';

///////////////////////////////////////////////////////////////////////////////////////////////////
// In this section, we set the user authentication, user and app ID, model details, and the URL
// of the image we want as an input. Change these strings to run your own example.
//////////////////////////////////////////////////////////////////////////////////////////////////

const returnClarifaiRequestOptions = imageURL => {
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
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    mode: 'cors',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Key ' + PAT,
    },
    body: raw,
  };

  return requestOptions;
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',
      },
    };
  }

  // Testing
  // componentDidMount() {
  //   fetch('http://localhost:3000')
  //     .then((response) => response.json())
  //     .then(console.log);
  // }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };
  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    console.log(data.outputs[0].data.regions[0].region_info.bounding_box);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = box => {
    this.setState({ box: box });
    // console.log('here is the box: ', box)
  };

  onInputChange = event => {
    console.log(event.target.value);
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = event => {
    console.log('click');
    this.setState({ imageURL: this.state.input });

    // app.models.predict('face-detection', this.state.input)

    // fetch("/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
    // .then(response => response.json())
    //   .then(result => console.log(result))
    //   .catch(error => console.log('error', error));
    //result.outputs[0].data.regions[0].region_info.bounding_box

    fetch(
      '/v2/models/' + 'face-detection' + '/outputs',
      returnClarifaiRequestOptions(this.state.input)
    )
      .then(response => response.json())
      .then(result => {
        if (result) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            });
        }
        this.displayFaceBox(this.calculateFaceLocation(result));
      })
      .catch(err => console.log(err));
  };

  onRouteChange = route => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const {
      isSignedIn,
      imageURL,
      route,
      box,
      user: { name, entries },
    } = this.state;
    // const { name, entries } = user;

    return (
      <div className="App">
        <ParticlesBg type="circles" bg={true} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === 'home' ? (
          <div>
            <Logo />
            <Rank name={name} entries={entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageURL={imageURL} />
          </div>
        ) : this.state.route === 'signin' ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
