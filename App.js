
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {REACT_APP_OPENWEATHER_API_KEY} from '@env';

export default function App() {
  const [data,setData] = useState(null);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [bgImg, setBgImg] = useState(require('./assets/sunny.jpg'))

  useEffect(()=>{
    const geolocationAPI = navigator.geolocation;
    if (!geolocationAPI) {
      alert('Geolocation API is not available in your browser!, using New York, NY for demo')
      fetchData('40.7128', '-74.0060'); 
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchData(position.latitude, position.longitude);      
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
    if (data) {
      setSelectedForecast(data[0]);
    }    
  },[data])

  useEffect(()=>{
    console.log(selectedForecast);
    if (selectedForecast) {
      const weather = selectedForecast.weather[0].main;

      if ( selectedForecast.dt > selectedForecast.sys.sunset) {
        setBgImg(require('./assets/night.jpg'))
      } else if (weather.toLowerCase() === 'rain' || weather.toLowerCase() === 'drizzle') {
        setBgImg(require('./assets/rainy.jpg'))
      } else if (weather.toLowerCase() === 'clouds') {
        setBgImg(require('./assets/cloudy.jpg'))
      } else {
        setBgImg(require('./assets/sunny.jpg'))
      }
    }
  },[selectedForecast])

  const fetchData =(lat, lon)=>{
    fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${REACT_APP_OPENWEATHER_API_KEY}`)
    .then(response=>response.json())
    .then(json=>setData(json.list))
  }

  const handleWeatherForecastPress =(forecast)=>{
    setSelectedForecast(forecast)
  }

  const renderForecast = ({item}) => {
    console.log('forecast', item);
    return(
      <TouchableOpacity key={item.dt} style={styles.weatherForecast} onPress={()=>handleWeatherForecastPress(item)}>
        <Image style={styles.weatherImage}
        source={{uri:'http://openweathermap.org/img/wn/'+item?.weather[0]?.icon+'@2x.png'}} />
        <Text>
          {new Date(item?.dt).toLocaleString() || ''}
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
          <Text style={styles.title}>
            Weather Forecast
          </Text>
        </View>
        <View style={styles.descriptionView}>
          <View style={styles.row}>
            <Text style={styles.weatherTitle}>{selectedForecast?.weather[0]?.description || ''}</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Highest Temp</Text>
              <Text style={styles.rowValue}>
                {selectedForecast?.main?.temp_max || ''}
              </Text>
            </View>
            <View>
              <Text style={styles.rowTitle}>Lowest TEmp</Text>
              <Text style={styles.rowValue}>
                {selectedForecast?.main?.temp_min || ''}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Humidity</Text>
              <Text style={styles.rowValue}>
                {selectedForecast?.main?.humidity || ''}
              </Text>
            </View>
            <View>
              <Text style={styles.rowTitle}>Pressure</Text>
              <Text style={styles.rowValue}>
                {selectedForecast?.main?.pressure || ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.weatherView}>
          <FlatList 
            data={data}
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
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  descriptionView:{
    flex:2,
    justifyContent:'center',
    alignItems:'center'
  },
  title:{
    fontSize:40,
    textAlign:'center',
    color: 'white'
  },
  weatherForecast:{
    height:150,
    width:150,
    borderWidth:1,
    borderColor:'grey',
    backgroundColor: 'white',
    marginHorizontal:10,
    borderRadius:5,
    justifyContent:'center',
    alignItems:'center'
  },
  weatherImage:{
    height:70,
    width:70,
  },
  weatherTitle:{
    fontWeight:'bold',
    fontSize:30,
    textAlign:'center',
    color: 'white'
  },
  row:{
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-around',
    marginVertical:15
  },
  rowTitle:{
    fontWeight:'bold',
    fontSize:18,
    textAlign:'center',
    color: 'white'
  },
  rowValue:{
    fontSize:14,
    marginTop:5,
    textAlign:'center',
    color: 'white'
  },
  weatherView:{
    flex:3,
    justifyContent:'center',
    alignItems:'center'
  },
});
