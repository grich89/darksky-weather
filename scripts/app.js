((() => {

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
  function buildApp() {

      // retrieve api keys from firebase
      root.on("value", snapshot => {
        let geoKey = snapshot.child("geoApi").val();
        let dsKey = snapshot.child("dsApi").val();

        // show loading text
        showLoading();

        // make ajax call to the ip-api
        function ipLookUp() {
          let request = new XMLHttpRequest();
          request.open("GET", 'http://ip-api.com/json', true);
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
        }
        ipLookUp();

        // use callback functions to add lat & long from ip-api to darksky api
        function getWeather(coordinates) {
          const submit = document.getElementById('submit');
          let lat = coordinates.lat;
          let lng = coordinates.lon;

          // pass the coordinates into the Dark Sky api
          let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${dsKey}/${lat},${lng}`;

          // ajax request to geocoding api
          function getCoordinates(e) {
            e.preventDefault();
            let zip = document.getElementById('location').value;
            let geo = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${geoKey}`;
            let request = new XMLHttpRequest();
            request.open("GET", geo, true);
            request.send();
            request.onreadystatechange = function() {
              if (this.readyState === 4 && this.status === 200) {
                let coordinates = JSON.parse(this.responseText);
                updateCoordinates(coordinates);
                hideError();
              } else {
                showError();
              }
            };
          };

          // replace ip-based coordinates with geocoding on submit of zip code form
          function updateCoordinates(coordinates) {
            lat = coordinates.results[0].geometry.location.lat;
            lng = coordinates.results[0].geometry.location.lng;
            url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${dsKey}/${lat},${lng}`;
            ajaxRequest();
          }
          submit.addEventListener('click', getCoordinates);

          // make the ajax request to Dark Sky
          function ajaxRequest() {
            let request = new XMLHttpRequest();
            console.log(url);
            request.open("GET", url, true);
            request.send();
            request.onreadystatechange = function() {
              if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                displayWeather(response);
              } else {
                showError();
              }
            }
          };

          // display weather results
          function displayWeather(response) {
            let feed = document.getElementById('document-template');
            let arr = [];

            // grab the daily forecast data
            const days = ((response || {}).daily || {}).data;
            console.log(days);

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

            for(let i = list.length; i--;) {
              const weatherType = list[i];
              const elements = document.getElementsByClassName(weatherType);
              for (e = elements.length; e--;) {
                icons.set(elements[e], weatherType);
              }
            }

            icons.play();

          };

          // fire ajaxRequest based on ip address coordinates on page load
          ajaxRequest();

        };
      
    });
    
  };
  buildApp();
}))();