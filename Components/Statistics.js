import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Dimensions, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { firestore } from '../Misc/firebase';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { colors, Head } from '../Misc/presets';
import firebase from 'firebase/app';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: colors.white1,
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: colors.white1,
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(0, 166, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional  
    fillShadowGradientOpacity: 0.4,
};

const Statistics = ({navigation}) => {

    const itemsDatabaseRef = firestore.collection('items');

    const currentDateAndTime = new Date();
    const currentDate = firebase.firestore.Timestamp.fromDate(new Date(currentDateAndTime.getFullYear(), currentDateAndTime.getMonth(), currentDateAndTime.getDate(), 0, 0, 0));
    const currentWeek = () => {
        const sundayDate = currentDateAndTime.getDate() - currentDateAndTime.getDay();
        let currDate = currentDateAndTime.getDate() - currentDateAndTime.getDay();
        let currMonth = currentDateAndTime.getMonth();
        let currYear = currentDateAndTime.getFullYear();
        if(sundayDate < 1){
            if(currentDateAndTime.getMonth() - 1 < 0){
                currYear = currentDateAndTime.getFullYear() - 1;
                currMonth = 11;
                const i = (7 - currentDateAndTime.getDate())
                currDate = 31 - i;
            }
            else{
                currMonth = currentDateAndTime.getMonth() - 1;
                const i = (7 - currentDateAndTime.getDate())
                currDate = [0, 2, 4, 6, 7, 9, 11].includes(currMonth) ? 31 - i : [3, 5, 8, 10].includes(currMonth) ? 30 - i : 28 - i; 
            }          
        }
        return firebase.firestore.Timestamp.fromDate(new Date(currYear, currMonth, currDate, 0, 0, 0));
    };
    const currentMonth = firebase.firestore.Timestamp.fromDate(new Date(currentDateAndTime.getFullYear(), currentDateAndTime.getMonth(), 1, 0, 0, 0));

    const [activePeriod, setActivePeriod] = useState('Today');

    const timePeriod = (activePeriod === 'Today') ? currentDate : (activePeriod === 'This Week') ? currentWeek() : (activePeriod === 'This Month') ? currentMonth : currentDate;
    const query = itemsDatabaseRef.where('startDate', '>=', timePeriod).limit(80);
    const [_items] = useCollectionData(query, {idField: 'id'});

    const items = (sortBy) => { 
        
        let sItems = _items ? _items.map(item => {return {name: item.name, category: item.category, color: item.color, duration: item.endDate - item.startDate}}) : [];
        
        if(sortBy === 'name'){
            for (let i = 0; i < sItems.length; i++) {
                let field = sItems[i].name;        
                for (let j = i + 1; j < sItems.length; j++) {
                    if(field === sItems[j].name){
                        sItems[i].duration += sItems[j].duration;
                        sItems.splice(j, 1)
                    }
                }    
            }
    
            sItems = sItems.map(i => {
                if(i.name.length > 15){
                    const n = i.name.split('').slice(0, 10).join('') + '...';
                    return {name: n, category: i.category, color: i.color, duration: i.duration};
                }
                return i;
            })
        }
        else if(sortBy === 'category'){
            for (let i = 0; i < sItems.length; i++) {
                let field = sItems[i].category.name;        
                for (let j = i + 1; j < sItems.length; j++) {
                    if(field === sItems[j].category.name){
                        sItems[i].duration += sItems[j].duration;
                        sItems.splice(j, 1)
                    }
                }    
            }
    
            sItems = sItems.map(i => {
                if(i.category.name.length > 15){
                    const c = i.category.name.split('').slice(0, 10).join('') + '...';
                    return {name: i.name, category: {name: c, color: i.category.color}, color: i.color, duration: i.duration};
                }
                return i;
            })
        }

        return sItems;  
    }

    const barChartData = (sortBy) => {
        return(
            {
                labels: sortBy === 'name' ? items(sortBy).map(i => i.name) : items(sortBy).map(i => i.category.name),
                datasets: [
                    {
                        data: items(sortBy).map(i => (i.duration/3600).toFixed(2)),
                    }
                ],
            }
        );
    }

    const pieChartData = () => {
        return(
            items('category').map(item => {
                return {
                    name: item.category.name,
                    color: item.category.color,
                    duration: item.duration,
                    legendFontColor: colors.grey1
                }
            })
        );
    }

    return (
        <SafeAreaView style = {styles.safeAreaView}>
            <Head title = "Statistics" style = {{elevation: 10}} navigation = {navigation}/>
            <View style = {styles.toggleButtonsContainer}>
                <TouchableWithoutFeedback onPress = {() => setActivePeriod('Today')}>
                    <View style = {[styles.toggleButton, {backgroundColor: (activePeriod === 'Today') ? 'rgba(0, 166, 255, 0.5)' : 'rgba(0, 166, 255, 0.2)'}]}>
                        <Text style = {styles.toggleButtonText}>Today</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress = {() => setActivePeriod('This Week')}>
                    <View style = {[styles.toggleButton, {backgroundColor: (activePeriod === 'This Week') ? 'rgba(0, 166, 255, 0.5)' : 'rgba(0, 166, 255, 0.2)'}]}>
                        <Text style = {styles.toggleButtonText}>This Week</Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress = {() => setActivePeriod('This Month')}>
                    <View style = {[styles.toggleButton, {backgroundColor: (activePeriod === 'This Month') ? 'rgba(0, 166, 255, 0.5)' : 'rgba(0, 166, 255, 0.2)'}]}>
                        <Text style = {styles.toggleButtonText}>This Month</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <ScrollView style = {styles.container}>
                <Text style = {styles.title}>Total Task Duration</Text>
                <View style = {styles.chartContainer}>    
                    <Text style = {styles.title2}>By Name</Text>
                    {items('name') ? items('name').length > 0 ?
                    <ScrollView horizontal contentContainerStyle = {{alignItems: 'center', paddingHorizontal: 10}}> 
                        <BarChart
                            data = {barChartData('name')}
                            width = {(items('name').length <= 5) ? screenWidth - 20 : screenWidth + ((items('name').length - 5) * 10)}
                            height = {320}
                            chartConfig = {chartConfig}
                            style = {styles.graph}
                            yAxisSuffix = " Hrs"
                            verticalLabelRotation = {40}
                            fromZero = {true}
                            showValuesOnTopOfBars = {true}
                        /> 
                    </ScrollView> : <Text style = {[styles.title2, {alignSelf: 'center'}]}>No Tasks Added...</Text>
                                  : <Text style = {[styles.title2, {alignSelf: 'center'}]}>Loading...</Text>}
                </View>
                <View style = {styles.chartContainer}>    
                    <Text style = {styles.title2}>By Category</Text>
                    {items('category') ? items('category').length > 0 ?
                    <ScrollView horizontal contentContainerStyle = {{alignItems: 'center', paddingHorizontal: 10}}>
                        <BarChart
                            data = {barChartData('category')}
                            width = {(items('category').length <= 5) ? screenWidth - 20 : screenWidth + ((items('category').length - 5) * 10)}
                            height = {320}
                            chartConfig = {chartConfig}
                            style = {styles.graph}
                            yAxisSuffix = "  Hrs"
                            verticalLabelRotation = {40}
                            fromZero = {true}
                            showValuesOnTopOfBars = {true}
                        /> 
                    </ScrollView> : <Text style = {[styles.title2, {alignSelf: 'center'}]}>No Tasks Added...</Text>
                                  : <Text style = {[styles.title2, {alignSelf: 'center'}]}>Loading...</Text>}
                </View>
                {<View style = {styles.chartContainer}>
                    <Text style = {styles.title2}>Pie</Text>
                    {items('name') && items('name').length > 0 &&
                        <PieChart
                            data={pieChartData()}
                            width={screenWidth}
                            height={200}
                            chartConfig={chartConfig}
                            accessor={"duration"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            center={[0, 0]}
                        />
                    }
                </View>}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Statistics

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1
    },
    container: {
        backgroundColor: colors.white2,
        height: '100%'
    },
    head: {
        elevation: 10,
        width: '100%',
        backgroundColor: colors.primary1,
        paddingTop: 15,
        paddingTop: StatusBar.currentHeight + 5,
    },
    headText: {
        fontSize: 23,
        letterSpacing: 1.5,
        textAlign: 'center',
        paddingBottom: 15,
        color: colors.white1,
    },
    toggleButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: colors.white1,
        elevation: 5
    },
    toggleButton: {
        backgroundColor: 'rgba(0, 166, 255, 0.2)',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 15
    },
    chartContainer: {
        marginVertical: 10,
        paddingVertical: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'auto',
        backgroundColor: colors.white1
    },
    title: {
        fontSize: 23,
        color: colors.grey1,
        padding: 10
    },
    title2: {
        fontSize: 20,
        color: colors.grey1,
        padding: 10,
        backgroundColor: colors.white1,
        alignSelf: 'flex-start',
        marginBottom: 'auto'
    },
    graph: {
        backgroundColor: colors.white1,
        marginTop: 20,
    }
});