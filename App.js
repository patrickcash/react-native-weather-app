
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {REACT_APP_OPENWEATHER_API_KEY} from '@env';

export default function App() {
  const [location, setLocation] = useState({lat: '40.7128', lon: '-74.0060'});
  const [name, setName] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [bgImg, setBgImg] = useState(require('./assets/sunny.jpg'))
  const [textColor, setTextColor] = useState('white')

  useEffect(()=>{
    const geolocationAPI = navigator.geolocation;
    if (!geolocationAPI) {
      alert('Geolocation API is not available in your browser!, using New York, NY for demo')
      setLocation({lat: '40.7128', lon: '-74.0060'}); 
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({lat: position.latitude, lon: position.longitude});
      }, (error) => {
        alert(JSON.stringify(error))
      }, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
      });
    }
  },[])

  useEffect(()=>{
    if (location.lat && location.lon) {
      fetchCurrentWeather(location);
      fetchForecast(location);
    }    
  },[location])

  useEffect(()=>{
    if (forecasts) {
      setSelectedForecast(forecasts[0]);
    }    
  },[forecasts])

  useEffect(()=>{
    if (selectedForecast) {
      const weather = selectedForecast.weather[0].main;

      if ( selectedForecast.dt > selectedForecast.sys.sunset) {
        setBgImg(require('./assets/night.jpg'));
        setTextColor('white');
      } else if (weather.toLowerCase() === 'rain' || weather.toLowerCase() === 'drizzle') {
        setBgImg(require('./assets/rainy.jpg'));
        setTextColor('white');
      } else if (weather.toLowerCase() === 'clouds' || weather.toLowerCase() === 'snow') {
        setBgImg(require('./assets/cloudy.jpg'));
        setTextColor('white');
      } else {
        setBgImg(require('./assets/sunny.jpg'));
        setTextColor('black');
      }
    }
  },[selectedForecast])

  const fetchCurrentWeather =(location)=>{
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${REACT_APP_OPENWEATHER_API_KEY}`)
    .then(response=>response.json())
    .then(json=>{
      setName(json?.name)
      setCurrentWeather({weather: json?.weather[0]?.main, temp: json?.main?.temp})
    })
  }

  const fetchForecast =(location)=>{
    fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${REACT_APP_OPENWEATHER_API_KEY}`)
    .then(response=>response.json())
    .then(json=>setForecasts(json.list))
  }

  const handleWeatherForecastPress =(forecast)=>{
    setSelectedForecast(forecast)
  }

  const renderForecast = ({item}) => {
    return(
      <TouchableOpacity key={item.dt} style={styles.weatherForecast} onPress={()=>handleWeatherForecastPress(item)}>
        <Image style={styles.weatherImage} source={{uri:'http://openweathermap.org/img/wn/'+item?.weather[0]?.icon+'@2x.png'}} />
        <Text>
          {new Date(item?.dt * 1000).toLocaleString() || ''}
        </Text>
        <Text>
          Temp: {item?.main?.temp || ''}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={ bgImg } style={styles.imgBackgroud}>       
        <View style={styles.headerView}>
          <Text style={[styles.locationName, { color: textColor }]}>
            {name}
          </Text>
          <Text style={[styles.currentWeather, { color: textColor }]}>
            Current Conditions:
          </Text>
          <Text style={[styles.currentWeather, { color: textColor }]}>
            {currentWeather?.weather}    {currentWeather?.temp}º
          </Text>
        </View>
        <View style={styles.descriptionView}>
          <Text style={[styles.forecastTitle, { color: textColor }]}>
            Weather Forecast
          </Text>
          <View style={styles.row}>
            <Text style={[styles.rowTitle, { color: textColor }]}>{selectedForecast?.weather[0]?.main || ''}</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowTitle, { color: textColor }]}>Temp</Text>
              <Text style={[styles.rowValue, { color: textColor }]}>
                {selectedForecast?.main?.temp || ''}º
              </Text>
            </View>
            <View>
              <Text style={[styles.rowTitle, { color: textColor }]}>Feels Like</Text>
              <Text style={[styles.rowValue, { color: textColor }]}>
                {selectedForecast?.main?.feels_like || ''}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowTitle, { color: textColor }]}>Humidity</Text>
              <Text style={[styles.rowValue, { color: textColor }]}>
                {selectedForecast?.main?.humidity || ''}
              </Text>
            </View>
            <View>
              <Text style={[styles.rowTitle, { color: textColor }]}>Wind Speed</Text>
              <Text style={[styles.rowValue, { color: textColor }]}>
                {selectedForecast?.wind?.speed || ''} MPH
              </Text>
            </View>
            
          </View>
        </View>
        <View style={styles.weatherView}>
          <FlatList 
            data={forecasts}
            renderItem={renderForecast}
            keyExtractor={item=>item.dt}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{justifyContent:'center',alignItems:'center'}}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imgBackgroud: {
    flex: 1,
  },
  headerView:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationName:{
    marginTop: 20,
    fontSize: 40,
    textAlign: 'center'
  },
  currentWeather:{
    marginTop: 5,
    fontSize: 20,
    textAlign: 'center'
  },
  descriptionView:{
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  forecastTitle:{
    fontSize: 30,
    textAlign: 'center'
  },  
  row:{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 15
  },
  rowTitle:{
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center'
  },
  rowValue:{
    fontSize: 18,
    marginTop: 5,
    textAlign: 'center'
  },
  weatherForecast:{
    height: 180,
    width: 180,
    borderWidth: 1,
    borderColor:'grey',
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  weatherImage:{
    height: 120,
    width: 120,
  },
  weatherView:{
    flex:2,
    justifyContent:'center',
    alignItems:'center'
  },
});
