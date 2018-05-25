((() => {

  // user ip lookup was attempted -- below is ajax call
  // I'm successfully making the api call below & getting lat and long
  // I just need to separate out the google api call into a separate function, and only call it on the submit event

  /*function ipLookUp() {
    let request = new XMLHttpRequest();
    request.open("GET", 'http://ip-api.com/json', true);
    request.send();
    request.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        let response = JSON.parse(this.responseText);
        var lat = response.lat;
        var lng = response.lon;
        displayWeather(response);
      }
    };
  }
  ipLookUp();*/

  // Initialize Firebase
  const config = {
      apiKey: "AIzaSyCBpCSlpT3wyt1GHDQBhz7PSh7ZFTJFOcs",
      authDomain: "toast-weather-ap-1527000551858.firebaseapp.com",
      databaseURL: "https://toast-weather-ap-1527000551858.firebaseio.com",
      projectId: "toast-weather-ap-1527000551858",
      storageBucket: "",
      messagingSenderId: "279222770692"
  };

  firebase.initializeApp(config);
  const database = firebase.database();
  const root = database.ref();

  // retrieve zip code
  let zip = document.getElementById('location');
  zip.addEventListener("change", e => {
    zip = e.target.value;
  });

  document.getElementById('submit').addEventListener('click', buildApp);

  // loading
  function showLoading() {
    document.querySelector('.weather').innerHTML = "<p class='loading'>Loading</p>";
  }

  // errors
  function showError() {
    document.querySelector('.weather').innerHTML = "<p class='error'>Invalid zip :(</p>";
  }
  function hideError() {
    document.querySelector('.weather').innerHTML = '';
  }

  // build app!
  function buildApp(e) {

    e.preventDefault();

      // retrieve api keys from firebase
      root.on("value", snapshot => {
        let geoKey = snapshot.child("geoApi").val();
        let dsKey = snapshot.child("dsApi").val();
        let geo = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${geoKey}`;

        // show loading text
        showLoading();

        // ajax request to geocoding api
        function getCoordinates() {
          let request = new XMLHttpRequest();
          request.open("GET", geo, true);
          request.send();
          request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
              let coordinates = JSON.parse(this.responseText);
              getWeather(coordinates);
              hideError();
            } else {
              showError();
            }
          };
        };
        
        // use callback function to add lat & long to darksky api
        function getWeather(coordinates) {
          let lat = coordinates.results[0].geometry.location.lat;
          console.log(lat);
          let lng = coordinates.results[0].geometry.location.lng;
          console.log(lng);

          // pass the coordinates into the Dark Sky api
          let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${dsKey}/${lat},${lng}`;

          // make the ajax request to Dark Sky
          function ajaxRequest() {
            let request = new XMLHttpRequest();
            console.log(url);
            request.open("GET", url, true);
            request.setRequestHeader("Access-Control-Allow-Origin", "*");
            request.send();
            request.onreadystatechange = function() {
              if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                console.log(response);
                displayWeather(response);
              }
            }
          };

          // display weather results
          function displayWeather(response) {
            let feed = document.getElementById('document-template');

            // grab the daily forecast data
            const days = ((response || {}).daily || {}).data;
            console.log(days);


            // empty array which will store formatted weather objects
            let arr = [];

            // increment date by 1 based on today's date, then format
            Date.prototype.addDays = function(days) {
              const dat = new Date(this.valueOf());
              dat.setDate(dat.getDate() + days);
              return dat.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });
            }

            const dat = new Date();

            for (let i = 0; i < days.length; i++) {
              obj = {};
              obj.icon = days[i].icon;
              if (i === 0) {
                obj.day = dat.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                });
              } else {
                obj.day = dat.addDays(i);
              }
              obj.sum = days[i].summary;
              obj.high = Math.round(days[i].temperatureHigh);
              obj.low = Math.round(days[i].temperatureLow);
              arr.push(obj);
            }

            console.log(arr);

            // create handlebars template to parse through arr
            const source = feed.innerHTML;
            const template = Handlebars.compile(source);
            const html = template(arr);
            document.querySelector('.weather').innerHTML = html;

            // add weather icons
            let icons = new Skycons();

            let list  = [
              "clear-day", "clear-night", "partly-cloudy-day",
              "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
              "fog"
            ];

            let i;

            for(i = list.length; i--;) {
              const weatherType = list[i];
              const elements = document.getElementsByClassName(weatherType);
              for (e = elements.length; e--;) {
                icons.set(elements[e], weatherType);
              }
            }

            icons.play();
          };

          ajaxRequest();

        };

        getCoordinates();
      
    });
    
  };
}))();