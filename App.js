import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import AddTaskMenu from './Components/AddTaskMenu';
import Home from './Components/Home';
import CreateTaskMenu from './Components/CreateTaskMenu';
import Statistics from './Components/Statistics';
import CreateCategoryMenu from './Components/CreateCategoryMenu';
import Tasks from './Components/Tasks';
import Categories from './Components/Categories';
import { StatusBar } from 'expo-status-bar';
import { colors } from './Misc/presets';
 
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
    const { state, ...rest } = props;
    const newState = { ...state}  //copy from state before applying any filter. do not change original state
    newState.routes = newState.routes.filter(item => !['Create Task', 'Create Category', 'Add Task'].includes(item.name)) //replace "Login' with your route name

    return (
         <DrawerContentScrollView {...props}>
             <DrawerItemList state={newState} {...rest} />
        </DrawerContentScrollView>
    )
}

export default function App() {

  return (
    <NavigationContainer>
      <StatusBar backgroundColor = "#0091de" style = "light"/>
      <Drawer.Navigator drawerContent = {(props) => <CustomDrawerContent {...props}/>}>
        <Drawer.Screen name = 'Home'>
          {props => <Home {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Tasks'>
          {props => <Tasks {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Categories'>
          {props => <Categories {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Statistics'>
          {props => <Statistics {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Add Task'>
          {props => <AddTaskMenu {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Create Task'>
          {props => <CreateTaskMenu {...props}/>}
        </Drawer.Screen>
        <Drawer.Screen name = 'Create Category'>
          {props => <CreateCategoryMenu {...props}/>}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer> 
  );
}

