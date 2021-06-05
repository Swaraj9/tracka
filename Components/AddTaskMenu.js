import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Picker, Text, Alert, TextInput, TouchableHighlight, SafeAreaView } from 'react-native'
import { firestore } from '../Misc/firebase';
import {colors, Head, PrimaryButton} from '../Misc/presets';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/app';

const AddTaskMenu = ({navigation}) => {
    
    const currentDateAndTime = new Date();
    const currentDate = new Date(currentDateAndTime.getFullYear(), currentDateAndTime.getMonth(), currentDateAndTime.getDate(), 0, 0, 0);
    const nextDate = new Date(currentDateAndTime.getFullYear(), currentDateAndTime.getMonth(), currentDateAndTime.getDate(), 23, 59, 59);
    
    //Fetching Tasks from DB
    const tasksDatabaseRef = firestore.collection('tasks');
    const queryTasks = tasksDatabaseRef.orderBy('name', 'asc').limit(80);
    const [tasks] = useCollectionData(queryTasks, {idField: 'id'});
    const [selectedTask, setSelectedTask] = useState(tasks ? tasks[0] : null);

    //Adding Item to DB
    const itemsDatabaseRef = firestore.collection('items');
    const queryItems = itemsDatabaseRef.where('startDate', '>=', firebase.firestore.Timestamp.fromDate(currentDate)).orderBy('startDate', 'desc');
    const [items] = useCollectionData(queryItems, {idField: 'id'});

    const queryItemsToDelete = itemsDatabaseRef.orderBy('startDate', 'asc').limit(10);
    const [itemsToDelete] = useCollectionData(queryItemsToDelete, {idField: 'id'});

    const [startTime, setStartTime] = useState(currentDate);
    const [endTime, setEndTime] = useState(startTime);

    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);

    const [selectedQuantity, setSelectedQuantity] = useState('Hours');
    const [duration, setDuration] = useState('');


    const reduceDate = (time) => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), time.getHours(), time.getMinutes(), 0);
    }

    useEffect(() => {
        if(items && items.length > 0){
            setStartTime(items[0].endDate.toDate());
        }
    }, [items])

    useEffect(() => {
        let absoluteDuration = 0;
        if(duration){
            if(selectedQuantity === 'Hours'){
                absoluteDuration = duration * 3600;
            }
            else if(selectedQuantity === 'Minutes'){
                absoluteDuration = duration * 60;
            }
        }

        setEndTime(new Date(startTime.valueOf() + (absoluteDuration * 1000)))
    }, [duration, selectedQuantity, startTime])

    const addItem = async () => {
        const finalStartDate = reduceDate(startTime);
        const finalEndDate = reduceDate(endTime);
        let isObstructed = false;

        for (let i = 0; i < itemsToDelete.length; i++) {
            if((currentDate - itemsToDelete[i].startDate.toDate())/3600000 >= 1440){
                await itemsDatabaseRef.doc(itemsToDelete[i].id).delete();
            }
        }
        

        for (let i = 0; i < items.length; i++) {
            if((finalStartDate >= items[i].startDate.toDate() && finalStartDate < items[i].endDate.toDate()) 
                || (finalEndDate > items[i].startDate.toDate() && finalEndDate <= items[i].endDate.toDate())
                || (finalStartDate <= items[i].startDate.toDate() && finalEndDate >= items[i].endDate.toDate())){
                isObstructed = true;
            }
        }

        if(finalStartDate >= finalEndDate){
            return Alert.alert('Invalid Date Combination', '"From" date should be less than "To" date')
        }
        else if((finalStartDate > nextDate || finalStartDate < currentDate) && (finalEndDate > nextDate || finalEndDate < currentDate)){
            return Alert.alert('Invalid Date Combination', 'The task must be only defined for the current day')
        }
        else if(isObstructed){
            return Alert.alert('Invalid Date Combination', 'The time duration is obstructed by another task');
        }
        await itemsDatabaseRef.add({
            name: selectedTask.name,
            category: selectedTask.category,
            startDate: finalStartDate,
            endDate: finalEndDate
        })
        navigation.navigate('Home');
    }

    const formatDate = (time) => {
        const h = time.getHours();
        const m = time.getMinutes().toString();
        const a = (h > 12 || (h === 12 && parseInt(m) > 0)) ? 'PM' : 'AM';

        const H = (h > 12 ? (h - 12) : h).toString();

        const toTwoDigits = (input) => {
            if(!input[1]){
                return( "0" + input[0]);
            }
            return input;
        }

        return(`${toTwoDigits(H)}:${toTwoDigits(m)} ${a}`);
    }

    return (
        <SafeAreaView style = {styles.safeAreaView}>
            <Head title = "Add Task" navigation = {navigation}/>
            <View style = {styles.container}>
                <Text style = {styles.title}>Task Name: </Text>
                <View style = {styles.picker}>
                    <Picker
                        selectedValue = {selectedTask}
                        onValueChange = {(itemValue) => {
                            setSelectedTask(itemValue);
                        }}
                    >
                        {tasks && tasks.map(task => <Picker.Item key = {tasks.indexOf(task)} label = {task.name} value = {task}/>)}
                    </Picker>
                </View>
                <TouchableHighlight onPress = {() => navigation.navigate('Create Task')} underlayColor = 'transparent'>
                    <View style = {styles.link}>
                        <Text style = {styles.linkText}>Create new Task ?</Text>
                    </View>    
                </TouchableHighlight>
                <View style = {styles.duration}>
                    <TextInput
                        placeholder = "Duration..."
                        style = {styles.input}
                        value = {duration}
                        keyboardType = 'numeric'
                        onChangeText = {setDuration}
                    />    
                    <View style = {styles.durationSelector}>
                        <Picker selectedValue = {selectedQuantity} onValueChange = {(quantity) => setSelectedQuantity(quantity)}>
                            <Picker.Item key = {1} label = 'Hours' value = 'Hours'/>
                            <Picker.Item key = {2} label = 'Minutes' value = 'Minutes'/>
                        </Picker>
                    </View>       
                </View>
                <PrimaryButton
                    style = {styles.button}
                    onPress = {() => setShowStartTime(true)}
                >From</PrimaryButton>
                <Text style = {styles.date}>{formatDate(startTime)}</Text>
                <PrimaryButton
                    style = {styles.button}
                    onPress = {() => setShowEndTime(true)}
                >To</PrimaryButton>
                <Text style = {styles.date}>{formatDate(endTime)}</Text>
                {showStartTime && <DateTimePicker
                    value = {startTime}
                    mode = 'time'
                    onChange = {(e, selectedTime) => {
                        setShowStartTime(false);
                        if(selectedTime){
                            setStartTime(selectedTime);
                        }
                    }}
                    timeZoneOffsetInSeconds
                />}
                {showEndTime && <DateTimePicker
                    value = {endTime}
                    mode = 'time'
                    onChange = {(e, selectedTime) => {
                        setShowEndTime(false);
                        if(selectedTime){
                            setEndTime(selectedTime);
                        }
                    }}
                />}
                <PrimaryButton
                    onPress = {addItem}
                    style = {{marginTop: 10}}
                >Submit</PrimaryButton>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1
    },
    container: {
        backgroundColor: colors.white2,
        paddingVertical: 20,
        paddingHorizontal: 10,
        height: '100%',
    },
    button: {
        marginTop: 10,
        borderBottomRightRadius: 1,
        borderBottomLeftRadius: 1,
    },
    date: {
        color: colors.black1,
        fontSize: 20,
        paddingVertical: 10,
        textAlign: 'center',
        backgroundColor: colors.white1,
        width: '100%',
        borderTopWidth: 0,
        borderWidth: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    picker: {
        backgroundColor: colors.white1,
        marginVertical: 10,
        borderRadius: 5,
    },
    title: {
        fontSize: 20,
        color: colors.black1
    },
    input: {
        backgroundColor: colors.white1,
        padding: 10,
        color: colors.black1,
        fontSize: 18,
        flex: 4,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5
    },
    durationSelector: {
        backgroundColor: colors.white1,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        flex: 3,
        borderLeftWidth: 1,
        borderColor: colors.grey1,
    },
    duration: {
        display: 'flex',
        flexDirection: 'row',
    },
    link: {
        paddingTop: 5,
        paddingBottom: 10,
    },
    linkText: {
        textAlign: 'center',
        fontSize: 17,
        color: colors.primary1
    }
});

export default AddTaskMenu
