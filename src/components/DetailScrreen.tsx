import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNFS from 'react-native-fs';

// Define your stack navigator's param list
type RootStackParamList = {
	Details: { selectedImage: ImageType };
};

// Define an interface for the route params
interface DetailScreenRouteParams {
	selectedImage: ImageType;
}

// Define an interface for the navigation props
type DetailScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Details'>;

interface DetailScreenProps {
	route: RouteProp<RootStackParamList, 'Details'>;
	navigation: DetailScreenNavigationProps;
}

interface ImageType {
	user: {
		name: string;
	};
	id: string;
	urls: {
		small: string;
	};
	likes: number;
}

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
	const { selectedImage } = route.params;

	const downloadImage = async () => {
		try {
			const { urls } = selectedImage;
			const downloadDest = `${RNFS.DocumentDirectoryPath}/${selectedImage.id}.jpg`;
			const result = await RNFS.downloadFile({
				fromUrl: urls.small,
				toFile: downloadDest,
			});

			await result.promise; // Wait for the download to finish

			if ((await result.promise).statusCode === 200) {
				console.log('Image downloaded to: ', downloadDest);
			} else {
				console.error('Download failed with status code: ', (await result.promise).statusCode);
			}
		} catch (error) {
			console.error('Download Error:', error);
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: selectedImage.urls.small }}
				style={styles.image}
			/>
			<Text style={styles.metadata}>
				User: {selectedImage.user.name} | Likes: {selectedImage.likes}
			</Text>
			<Pressable style={styles.downloadButton} onPress={downloadImage}>
				<Text style={styles.buttonText}>Download</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	image: {
		width: '100%',
		height: '60%',
	},
	metadata: {
		margin: 10,
		fontSize: 16,
	},
	downloadButton: {
		backgroundColor: 'blue',
		padding: 10,
		borderRadius: 5,
	},
	buttonText: {
		color: 'white',
	},
});

export default DetailScreen;
