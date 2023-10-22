import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import PhotoSearch from './src/components/photoSearch';
import PhotoDetailPage from './src/components/photoDetailPage';

const Stack = createStackNavigator();

const App = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
				}}
			>
				<Stack.Screen name="PhotoSearch" component={PhotoSearch} />
				<Stack.Screen name="PhotoDetailPage" component={PhotoDetailPage} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;
