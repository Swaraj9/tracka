import React, { useEffect, useState } from 'react';
import { TextInput, View, StyleSheet, Text, TouchableHighlight, LogBox, Alert, SafeAreaView } from 'react-native';
import { firestore } from '../Misc/firebase';
import {colors, Head, PrimaryButton} from '../Misc/presets';
import ColorPicker from 'react-native-wheel-color-picker';

const CreateCategoryMenu = ({ navigation }) => {

    useEffect(() => {
        LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    }, [])

    const categorysDatabaseRef = firestore.collection('categories');

    const [categoryName, setCategoryName] = useState('');

    const [color, setColor] = useState('#fcaf08');
    const [showColorWheel, setShowColorWheel] = useState(false);

    const addCategory = async () => {

        if(!categoryName){
            return Alert.alert('Missing Field', 'Category Name is a required Field');
        }
        await categorysDatabaseRef.add({
            name: categoryName,
            color: color
        });

        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Head title = "Create Category" navigation = {navigation}/>
            <View style = {styles.container}>
                <TextInput
                    style={styles.input}
                    onChangeText={setCategoryName}
                    value={categoryName}
                    autoFocus={true}
                    placeholder="Category Name..."
                />
                <View style={[styles.colorContainer, {height: showColorWheel ? 320 : 'auto'}]}>
                    <TouchableHighlight style = {styles.colorButton} onPress = {() => setShowColorWheel(!showColorWheel)} underlayColor = 'lightgrey'>
                        <View style = {{backgroundColor: color, width: '100%', height: '100%', borderRadius: 5}}></View>
                    </TouchableHighlight>
                    {showColorWheel && <ColorPicker
                        row={false}
                        swatches={true}
                        color={color}
                        onColorChange={setColor}
                        onColorChangeComplete={setColor}
                        swatchesOnly={false}
                        thumbSize={40}
                        sliderSize={0}
                        noSnap={false}
                        discrete={false}
                    />}
                </View>
                <PrimaryButton onPress = {addCategory} style = {{marginBottom: 20}} textStyling = {{fontSize: 20}}>Submit</PrimaryButton>
            </View>
        </SafeAreaView>
    )
}

export default CreateCategoryMenu;

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.white2,
        paddingVertical: 20,
        paddingHorizontal: 10,
        height: '100%',
    },
    input: {
        backgroundColor: colors.white1,
        padding: 10,
        borderRadius: 5,
        color: colors.black1,
        marginBottom: 20,
        height: 50,
        fontSize: 17
    },
    colorContainer: {
        height: 'auto',
        marginBottom: 20,
    },
    text: {
        fontSize: 20,
        color: colors.black1,
        marginBottom: 5
    },
    colorButton: {
        width: '100%',
        height: 50,
        borderRadius: 5,
        padding: 5,
        backgroundColor: colors.white1,
    }
});