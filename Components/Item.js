import React from 'react';
import { StyleSheet, Text, View, PanResponder, Animated, Dimensions} from 'react-native';
import {colors} from '../Misc/presets';
import {firestore} from '../Misc/firebase';
import { Ionicons } from '@expo/vector-icons'; 

const Item = ({id, name, startDate, endDate, category}) => {
    
    const itemsDatabaseRef = firestore.collection('items');

    const screenWidth = Dimensions.get('window').width;

    const duration = () => {
        const h = (endDate - startDate)/3600;
        if(h % 2 === 1 || h % 2 === 0){
            return `${h} Hrs`
        }
        else{
            const m = (h - Math.floor(h)) * 60;
            if(Math.floor(h) === 0){
                return `${m} Mins`
            }
            return `${Math.floor(h)} Hrs ${m} Mins`;
        }
    }

    const getTimeString = (timestamp) => {
        const date = new Date(timestamp.toDate());
        const h = date.getHours();
        const m = date.getMinutes().toString();
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

    const deleteItem = async () => {
        await itemsDatabaseRef.doc(id).delete();
    }

    const pan = React.useRef(new Animated.ValueXY()).current;
    const heightAnim = React.useRef(new Animated.Value(100)).current;

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
                        duration: 250,
                        useNativeDriver: false,
                    }).start(() => {
                        deleteItem();
                    })
                })
            }
        }
    });
    
    return (
        <Animated.View style = {{backgroundColor: colors.primary1, height: heightAnim || 100}}>
            <View style = {{height: 100}}>
                <Ionicons name="trash" size={44} color="white" style={{alignSelf: 'flex-end', marginTop: 'auto', marginBottom: 'auto', marginRight: 10}} />
            </View>     
            <Animated.View style = {[{transform: [{translateX: pan.x}], backgroundColor: colors.white1, alignItems: 'center', top: (-100)}]}>
                <View style = {[styles.container, {height: 100}]} {...panResponder.panHandlers}>
                    <View style = {styles.header}>
                        <Text numberOfLines = {1} style = {[styles.text, { color: colors.black1, fontSize: 18, letterSpacing: 1.3}]}>{name}</Text>
                        <Text style = {[styles.text, {color: colors.grey1}]}>{getTimeString(startDate) + ' - ' +  getTimeString(endDate)}</Text>
                    </View>
                    <View style = {styles.footer}>
                        <Text style = {[styles.categoryText, {backgroundColor: category.color}]}>{category.name}</Text>
                        <Text style = {styles.durationText}>{duration()}</Text>
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    )
}

export default Item

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        width: '95%',
        backgroundColor: colors.white1,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    text: {
        fontSize: 16,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10
    },
    footer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        marginLeft: 'auto',
        marginTop: 'auto',
        alignItems: 'center'
    },
    categoryText: {
        textAlign: 'center',
        borderRadius: 20,
        padding: 10,
        color: colors.black1,
        maxWidth: 120,
    },
    durationText: {
        marginLeft: 'auto',
        color: colors.grey1,
    }
});