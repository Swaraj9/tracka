import React from 'react';
import {ScrollView, View, Text, TouchableHighlight, StyleSheet, SafeAreaView} from 'react-native';
import Task from './Item';
import {colors, head, Head} from '../Misc/presets';
import { firestore } from '../Misc/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';
import 'react-native-svg';

const Home = ({navigation}) => {

  const currentDateAndTime = new Date();
  const currentDate = new Date(currentDateAndTime.getFullYear(), currentDateAndTime.getMonth(), currentDateAndTime.getDate(), 0, 0, 0);
  const currentDateTimestamp = firebase.firestore.Timestamp.fromDate(currentDate);

  const itemsDatabaseRef = firestore.collection('items');
  const query = itemsDatabaseRef.where('startDate', '>=', currentDateTimestamp).orderBy('startDate', 'asc').limit(80);

  const [items] = useCollectionData(query, {idField: 'id'}); 

  return (
    <SafeAreaView style = {styles.safeAreaView}>
        <Head title = "Today's Tasks" navigation = {navigation}/>
        <ScrollView style = {styles.container}>
            <View style = {styles.taskList}>
              {items ? items.length > 0 ?
              items.map(item => <Task key = {item.id} index = {items.indexOf(item)} id = {item.id} name = {item.name} startDate = {item.startDate} endDate = {item.endDate} category = {item.category}/>) 
              : <Text style = {styles.msg}>No Task Added...</Text>
              : <Text style = {styles.msg}>Loading...</Text>}
            </View>
        </ScrollView>
        <TouchableHighlight 
            style = {styles.addBtn}
            onPress = {() => navigation.navigate('Add Task')}
            underlayColor = {colors.primary2}
        >
              <Text style = {styles.addBtnText}>+</Text>
        </TouchableHighlight>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
    },
    container: {
      backgroundColor: colors.white1,
    },
    taskList: {
      height: '100%',
      backgroundColor: colors.white1,
    },
    addBtn: {
      backgroundColor: colors.primary1,
      paddingVertical: 10,
      elevation: 4,
      paddingHorizontal: 20,
      position: 'absolute', 
      bottom: '5%', 
      right: "5%", 
      borderRadius: 999
    },
    addBtnText:{
      color: colors.white1,
      fontSize: 25
    },
    msg: {
      fontSize: 20,
      padding: 10,
      textAlign: 'center',
      marginTop: '60%',
      color: colors.grey1
    },
    chartContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: colors.white2,
      marginBottom: 20,
      color: colors.black1
    }
});
  