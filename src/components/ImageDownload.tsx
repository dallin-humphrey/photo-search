import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Define the props for the ImageDetails component
interface ImageDetailsProps {
	imageUrl: string;
	imageDetails: any; // TODO: Replace with the actual type for image details
	onClose: () => void;
}

// Create the ImageDetails component
const ImageDetails: React.FC<ImageDetailsProps> = ({ imageUrl, imageDetails, onClose }) => {
	return (
		<View style={styles.container}>
			{/* Display the image */}
			<Image style={styles.image} source={{ uri: imageUrl }} />

			{/* Display the user's name */}
			<Text style={styles.imageDetailText}>User: {imageDetails.user.name}</Text>

			{/* Display the image description or a default text if not available */}
			<Text style={styles.imageDetailText}>Description: {imageDetails.description || 'No description'}</Text>

			{/* TODO: Add more image details here as needed */}

			{/* Close button to trigger the onClose callback */}
			<TouchableOpacity style={styles.closeButton} onPress={onClose}>
				<Text style={styles.closeButtonText}>Close</Text>
			</TouchableOpacity>
		</View>
	);
};

// Define the styles for the component
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	image: {
		width: '80%',
		height: '80%',
		resizeMode: 'contain',
	},
	imageDetailText: {
		color: 'white',
		marginBottom: 10,
	},
	closeButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		backgroundColor: 'red',
		borderRadius: 15,
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	closeButtonText: {
		color: 'white',
		fontSize: 18,
	},
});

export default ImageDetails;
