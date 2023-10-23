import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	TextInput,
	FlatList,
	Image,
	StyleSheet,
	SafeAreaView,
	Pressable,
	Text,
	Animated,
	Dimensions,
	NativeScrollEvent,
	NativeSyntheticEvent,
} from 'react-native';
import { searchPhotos } from '../api/unsplashApi';

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

const PhotoSearch = () => {
	const [searchTerm, setSearchTerm] = useState<string>('cat');
	const [images, setImages] = useState<ImageType[]>([]);
	const [page, setPage] = useState<number>(1);
	const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [totalImages, setTotalImages] = useState<number>(0);

	const slideAnim = useRef(new Animated.Value(1000)).current;
	const flatListRef = useRef<FlatList<ImageType> | null>(null);

	const fetchData = async () => {
		if (isLoading) {
			return; // Prevent multiple simultaneous requests
		}

		setIsLoading(true);

		try {
			const data = await searchPhotos(searchTerm, page);
			const newImages = [...images, ...data.results];
			setImages(newImages);
			setTotalImages(data.total);

			// If we've reached the limit of 500 images, stop loading more
			if (newImages.length >= 500) {
				return;
			}

			setPage(prevPage => prevPage + 1);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

	const handleLoadMore = (info: { distanceFromEnd: number }) => {
		if (!isLoading && images.length < 500 && info.distanceFromEnd < 100) {
			fetchData();
		}
	};


	const handleSearch = () => {
		setImages([]);
		setPage(1);
		setTotalImages(0);
		fetchData();
	};

	const slideIn = () => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 0,
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

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		Animated.event(
			[{ nativeEvent: { contentOffset: { y: slideAnim } } }],
			{ useNativeDriver: false }
		)(event);
	};

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
			<FlatList
				ref={flatListRef}
				data={images}
				keyExtractor={item => item.id}
				renderItem={renderImageItem}
				onEndReached={handleLoadMore} // Trigger handleLoadMore when reaching the end of the list
				onEndReachedThreshold={0.1} // Adjust this threshold value as needed
				style={{ opacity: selectedImage ? 0 : 1 }}
				onScroll={onScroll}
				scrollEventThrottle={16}
			/>

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
		height: screenHeight > 600 ? 400 : 200, // Adjust the screen height breakpoint as needed
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
		height: 400,
		marginTop: 0,
	},
	closeButton: {
		position: 'absolute',
		top: 10,
		right: 10,
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
	imageDetails: {
		padding: 20,
	},
	imageDetailText: {
		color: 'white',
	},
});

export default PhotoSearch;