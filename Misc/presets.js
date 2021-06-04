import { TouchableHighlight, View, StyleSheet, Text, StatusBar, TouchableWithoutFeedback } from "react-native";
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; 

const colors = {
    white1: "#f5f5f5",
    white2: "#e6e6e6",
    black1: "#212121",
    grey1: "#757575",
    primary1: "#00a6ff",
    primary2: "#0085cc"
}

const PrimaryButton = props => {
    return(
        <TouchableHighlight onPress = {props.onPress} underlayColor = {props.underlayColor ? props.underlayColor : colors.primary2} style = {{...styles.container, ...props.style}}>
            <View style = {styles.button}> 
                <Text style = {{...styles.text, ...props.textStyling}}>
                    {props.children}
                </Text>
            </View>
        </TouchableHighlight>
    );
}

const Head = props => {
    return(
        <View style = {{...styles.head, ...props.style}}>
            <TouchableWithoutFeedback onPress = {() => {props.navigation ? props.navigation.goBack() : {}}}>
                <Ionicons name="arrow-back-outline" size={31} color={colors.white1} style = {{marginLeft: 10, marginRight: 20, marginTop: 'auto', marginBottom: 'auto'}}/>
            </TouchableWithoutFeedback>
            <Text style = {styles.headText}>{props.title}</Text>
        </View>
    );
}

const head = {
    fontSize: 23,
    textAlign: 'center',
    letterSpacing: 1,
    color: colors.white1,
    elevation: 5,
    width: '100%',
    backgroundColor: colors.primary1,
    paddingTop: StatusBar.currentHeight + 5,
    paddingBottom: 15,
}

const styles = StyleSheet.create({
    container: {
        height: 'auto',
        width: 'auto',
        borderRadius: 5,
        elevation: 3,
        backgroundColor: colors.primary1,
    },
    button: {
        padding: 10,
        borderRadius: 5,
    },
    text:{
        color: colors.white1,
        fontSize: 16,
        textAlign: 'center',
    },
    head: {
        elevation: 5,
        width: '100%',
        backgroundColor: colors.primary1,
        paddingTop: StatusBar.currentHeight + 15,
        paddingBottom: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    headText: {
        fontSize: 23,
        textAlign: 'center',
        letterSpacing: 1,
        color: colors.white1,
    }
});

export {colors, PrimaryButton, head, Head};