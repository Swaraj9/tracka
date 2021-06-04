import React, { useEffect, useState } from 'react';
import { TextInput, View, StyleSheet, Text, TouchableHighlight, LogBox, Alert, SafeAreaView, Picker, ScrollView } from 'react-native';
import { firestore } from '../Misc/firebase';
import {colors, Head, PrimaryButton} from '../Misc/presets';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const CreateTaskMenu = ({ navigation }) => {

    useEffect(() => {
        LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    }, [])

    const tasksDatabaseRef = firestore.collection('tasks');

    const [taskName, setTaskName] = useState('');

    const categoriesDatabaseRef = firestore.collection('categories');
    const queryCategories = categoriesDatabaseRef.orderBy('name', 'asc');
    const [categories] = useCollectionData(queryCategories, {idField: 'id'});
    const [selectedCategory, setSelectedCategory] = useState(categories ? categories[0] : null);

    const addTask = async () => {

        if(!taskName){
            return Alert.alert('Missing Field', 'Task Name is a required Field');
        }
        await tasksDatabaseRef.add({
            name: taskName,
            category: selectedCategory,
        });

        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Head title = "Create Task" navigation = {navigation}/>
            <ScrollView style = {styles.container} contentContainerStyle = {{paddingTop: 20}}>
                <TextInput
                    style={styles.input}
                    onChangeText={setTaskName}
                    value={taskName}
                    autoFocus={true}
                    placeholder="Task Name..."
                />
                <View style = {styles.picker}>
                    <Picker
                        selectedValue = {selectedCategory}
                        onValueChange = {(itemValue) => {
                            setSelectedCategory(itemValue);
                        }}
                    >
                        {categories && categories.map(category => <Picker.Item key = {category.id} label = {category.name} value = {category}/>)}
                    </Picker>
                </View>
                <TouchableHighlight onPress = {() => navigation.navigate('Create Category')} underlayColor = 'transparent'>
                    <View style = {styles.link}>
                        <Text style = {styles.linkText}>Create new Category ?</Text>
                    </View>    
                </TouchableHighlight>
                <PrimaryButton onPress = {addTask} style = {{marginBottom: 20}} textStyling = {{fontSize: 20}}>Submit</PrimaryButton>
            </ScrollView>
        </SafeAreaView>
    )
}

export default CreateTaskMenu;

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.white2,
        paddingHorizontal: 10,
        height: '100%',
    },
    input: {
        backgroundColor: colors.white1,
        padding: 10,
        borderRadius: 5,
        color: colors.black1,
        marginBottom: 10,
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
    picker: {
        backgroundColor: colors.white1,
        marginVertical: 10,
        borderRadius: 5,
    },
    colorButton: {
        width: '100%',
        height: 50,
        borderRadius: 5,
        padding: 5,
        backgroundColor: colors.white1,
    },
    link: {
        paddingTop: 5,
        paddingBottom: 10
    },
    linkText: {
        textAlign: 'center',
        fontSize: 17,
        color: colors.primary1
    }
});