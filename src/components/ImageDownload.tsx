import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';

interface ImageDownloadProps {
	imageUrl: string;
}

const ImageDownload: React.FC<ImageDownloadProps> = ({ imageUrl }) => {
	const downloadImage = async () => {
		try {
			if (Platform.OS === 'android') {
				const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					console.log('Permission denied. Cannot download the image.');
					return;
				}
			}

			const dirs = RNFetchBlob.fs.dirs;
			const downloadDir = Platform.OS === 'android' ? dirs.PictureDir : dirs.DocumentDir;
			const filename = imageUrl.split('/').pop();

			const res = await RNFetchBlob.config({
				fileCache: true,
				path: `${downloadDir}/${filename}`,
			}).fetch('GET', imageUrl);

			if (res.respInfo.status === 200) {
				console.log('Image downloaded successfully.');
			} else {
				console.log('Image download failed.');
			}
		} catch (error) {
			console.error('Error downloading image:', error);
		}
	};

	return (
		<View style={styles.container}>
			<Image style={styles.image} source={{ uri: imageUrl }} />
			{Platform.OS === 'android' && (
				<TouchableOpacity style={styles.downloadButton} onPress={downloadImage}>
					<Text style={styles.buttonText}>Download Image</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
	},
	image: {
		width: 200,
		height: 200,
		marginBottom: 20,
	},
	downloadButton: {
		backgroundColor: 'green',
		padding: 10,
		borderRadius: 5,
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});

export default ImageDownload;
