import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Image, StyleSheet, SafeAreaView, Pressable, Text, Animated, Dimensions } from 'react-native';
import { searchPhotos } from '../api/unsplashApi';
import PhotoDetailPage from '../components/photoSearch';

const { height: screenHeight } = Dimensions.get('window');

interface ImageType {
	user: {
		name: string;
	};
	id: string;
	urls: {
		small: string;
	};
	description?: string;
	created_at?: string;
	updated_at?: string;
	likes?: number;
	color?: string;
	height?: number;
	width?: number;
}

const PhotoSearch: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [images, setImages] = useState<ImageType[]>([]);
	const [page, setPage] = useState<number>(1);
	const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

	const slideAnim = useRef(new Animated.Value(1000)).current;

	const fetchData = async () => {
		try {
			const data = await searchPhotos(searchTerm, page);
			setImages(prevImages => [...prevImages, ...data.results]);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const handleLoadMore = () => {
		setPage(prevPage => prevPage + 1);
	};

	const handleSearch = () => {
		setImages([]);
		setPage(1);
		fetchData();
	};

	const slideIn = () => {
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 500,
			useNativeDriver: true,
		}).start();
	};

	const slideOut = () => {
		Animated.timing(slideAnim, {
			toValue: 1000,
			duration: 500,
			useNativeDriver: true,
		}).start(() => setSelectedImage(null));
	};

	useEffect(() => {
		if (selectedImage) {
			slideIn();
		}
	}, [selectedImage]);

	const onImagePress = (item: ImageType) => {
		setSelectedImage(item);
	};

	const renderImageItem = ({ item }: { item: ImageType }) => (
		<Pressable onPress={() => onImagePress(item)}>
			<Image style={styles.image} source={{ uri: item.urls.small }} />
		</Pressable>
	);

	useEffect(() => {
		console.log('Image Data:', images);
	}, [images]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.searchBarContainer}>
				<TextInput
					style={styles.searchBar}
					placeholder="Search for images..."
					value={searchTerm}
					onChangeText={text => setSearchTerm(text)}
				/>
				<Pressable style={styles.pressableButton} onPress={handleSearch}>
					<Text style={styles.buttonText}>Search</Text>
				</Pressable>
			</View>
			<View style={styles.imageListContainer}>
				<FlatList
					data={images}
					keyExtractor={item => item.id}
					renderItem={renderImageItem}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
				/>
			</View>
			{selectedImage && (
				<Animated.View style={[styles.selectedImageContainer, { transform: [{ translateY: slideAnim }] }]}>
					<Pressable style={styles.closeButton} onPress={slideOut}>
						<Text style={styles.closeButtonText}>X</Text>
					</Pressable>
					<Image style={styles.selectedImage} source={{ uri: selectedImage.urls.small }} />
					<View style={styles.imageDetails}>
						<Text style={styles.imageDetailText}>User: {selectedImage.user.name}</Text>
						<Text style={styles.imageDetailText}>Description: {selectedImage.description || 'No description'}</Text>
						<Text style={styles.imageDetailText}>ID: {selectedImage.id}</Text>
						<Text style={styles.imageDetailText}>Created At: {selectedImage.created_at}</Text>
						<Text style={styles.imageDetailText}>Updated At: {selectedImage.updated_at}</Text>
						<Text style={styles.imageDetailText}>Likes: {selectedImage.likes}</Text>
						<Text style={styles.imageDetailText}>Color: {selectedImage.color}</Text>
						<Text style={styles.imageDetailText}>Height: {selectedImage.height}</Text>
						<Text style={styles.imageDetailText}>Width: {selectedImage.width}</Text>
					</View>
					{/* Add the PhotoDetailPage component with the selected image */}
					<PhotoDetailPage imageUrl={selectedImage.urls.small} />
				</Animated.View>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	searchBarContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 15,
		backgroundColor: 'white',
	},
	searchBar: {
		flex: 1,
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginRight: 10,
		paddingLeft: 8,
		borderRadius: 5,
	},
	pressableButton: {
		backgroundColor: 'green',
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 5,
	},
	buttonText: {
		color: 'white',
	},
	image: {
		width: '100%',
		height: 200,
	},
	imageListContainer: {
		flex: 1,
	},
	selectedImageContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,1)',
		alignItems: 'center',
		maxHeight: screenHeight,
	},
	selectedImage: {
		width: '100%',
		height: 300,
		marginTop: 0,
	},
	closeButton: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: 'gray',
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
	imageDetails: {
		padding: 20,
	},
	imageDetailText: {
		color: 'white',
	},
});

export default PhotoSearch;
