import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';

interface ImageType {
	id: string;
	urls: {
		small: string;
		full: string;
	};
	user: {
		name: string;
	};
	description: string;
	// Add image data field
	imageData: any; // You can change 'any' to a more specific type if needed
}

interface StackParams {
	PhotoDetails: {
		image: ImageType;
	};
}

interface Props {
	route: RouteProp<StackParams, 'PhotoDetails'>;
}

const PhotoDetailPage: React.FC<Props> = ({ route }) => {
	const { image } = route.params;

	return (
		<SafeAreaView style={styles.container}>
			<Image style={styles.image} source={{ uri: image.urls.full }} />
			<View style={styles.textContainer}>
				<Text style={styles.text}>User: {image.user.name}</Text>
				<Text style={styles.text}>Description: {image.description || 'No description'}</Text>
			</View>

			{/* Display Image Data */}
			<View style={styles.imageDataContainer}>
				<Text style={styles.imageDataTitle}>Image Data:</Text>
				<ScrollView>
					{image.imageData.map((data: any, index: number) => (
						<View key={index} style={styles.imageData}>
							<Text>{JSON.stringify(data, null, 2)}</Text>
						</View>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'lightgrey',
	},
	image: {
		width: '100%',
		height: 600,
	},
	textContainer: {
		padding: 10,
	},
	text: {
		color: '#000',
		fontSize: 16,
		marginBottom: 10,
	},
	// Add new styles for displaying image data
	imageDataContainer: {
		padding: 10,
		backgroundColor: 'white',
		marginVertical: 10,
		borderColor: 'grey',
		borderWidth: 1,
	},
	imageDataTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	imageData: {
		backgroundColor: 'white',
		borderColor: 'grey',
		borderWidth: 1,
		padding: 10,
		marginBottom: 10,
	},
});

export default PhotoDetailPage;
