import React from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Animated, PanResponder, Dimensions, ActivityIndicator } from 'react-native'
import { firestore } from '../Misc/firebase'
import { colors, Head, PrimaryButton } from '../Misc/presets'
import { Ionicons } from '@expo/vector-icons'; 

const height = 65;

const Categories = ({navigation}) => {
    const categoriesDatabaseRef = firestore.collection('categories');
    const query = categoriesDatabaseRef.orderBy('name', 'asc').limit(80);
    const [categories, loading, error] = useCollectionData(query, {idField: 'id'})
 
    return (
        <SafeAreaView style = {styles.safeAreaView}>
            <Head title = "Categories" navigation = {navigation}/>
            <ScrollView style = {styles.container}>
                {
                    loading ? <View style = {{alignSelf: 'center', marginTop: '60%'}}><ActivityIndicator size = 'large' color = {colors.primary1}/></View>
                            : error ? <Text style = {styles.msg}>Unable to fetch data...</Text>
                                    : categories.length > 0 ? categories.map(category => <Category key = {category.id} id = {category.id} name = {category.name} color = {category.color}/>)
                                                   : <Text style = {styles.msg}>No Tasks Added...</Text>          
                }
            </ScrollView>
            <View style = {styles.footer}>
                <PrimaryButton onPress = {() => navigation.navigate('Create Category')} style = {{elevation: 0}}>
                    <Text>Create Category</Text>
                </PrimaryButton>
            </View>
        </SafeAreaView>
    )
}

export default Categories;

const Category = ({id, name, color}) => {
    const tasksDatabaseRef = firestore.collection('categories');
    const deleteTask = () => {
        tasksDatabaseRef.doc(id).delete()
    }

    const screenWidth = Dimensions.get('window').width;

    const pan = React.useRef(new Animated.ValueXY()).current;
    const heightAnim = React.useRef(new Animated.Value(height)).current;

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
        },
        onPanResponderMove: (evt, ges) => {
            if(ges.x0 > screenWidth/3){
                pan.setValue({x: ges.dx, y: 0})
            }
        },
        onPanResponderRelease: (evt, ges) => {
            if((-ges.dx) <= screenWidth/3){
                Animated.spring(pan, {
                    toValue: {x: 0, y: 0},
                    useNativeDriver: true
                }).start();
            }
            else{
                Animated.spring(pan, {
                    toValue: {x: (-screenWidth), y: 0},
                    useNativeDriver: true
                }).start(() => {
                    Animated.timing(heightAnim, {
                        toValue: 0,
                        duration: 750,
                        useNativeDriver: false,
                    }).start(() => {
                        deleteTask();
                    })
                })
            }
        }
    });

    return(
        <Animated.View style = {{height: heightAnim || height, backgroundColor: colors.primary1}}>
            <View style = {{height: height}}>
                <Ionicons name="trash" size={44} color="white" style={{alignSelf: 'flex-end', marginTop: 'auto', marginBottom: 'auto', marginRight: 10}} />
            </View> 
            <Animated.View style = {{backgroundColor: colors.white1, alignItems: 'center', transform: [{translateX: pan.x}], top: (-height)}} {...panResponder.panHandlers}>
                <View style = {styles.taskContainer}>
                    <Text style = {styles.text}>{name}</Text>
                    <Text style = {[styles.categoryText, {backgroundColor: color}]}>{''}</Text>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.white1,
    },
    taskContainer: {
        paddingHorizontal: 10,
        width: '95%',
        backgroundColor: colors.white1,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        height: height,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        color: colors.black1, 
        fontSize: 18, 
        letterSpacing: 1.3
    },
    footer: {
        padding: 10,
        backgroundColor: colors.white1,
        elevation: 15,
    },
    categoryText: {
        textAlign: 'center',
        borderRadius: 20,
        padding: 10,
        color: colors.black1,
        maxWidth: 120,
    },
    msg: {
        fontSize: 20,
        padding: 10,
        textAlign: 'center',
        marginTop: '60%',
        color: colors.grey1
    }
});