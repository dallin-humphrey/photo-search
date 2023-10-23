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
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [images, setImages] = useState<ImageType[]>([]);
	const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [totalImages, setTotalImages] = useState<number>(0);
	const [page, setPage] = useState<number>(1); // Current page for the active search
	const [orientationFilter, setOrientationFilter] = useState<string>('');

	// New state for the popular filter
	const [popularFilter, setPopularFilter] = useState<boolean>(false);

	const slideAnim = useRef(new Animated.Value(1000)).current;
	const flatListRef = useRef<FlatList<ImageType> | null>(null);

	const fetchData = async (): Promise<void> => {
		// Prevent multiple simultaneous requests
		if (isLoading) {
			return;
		}

		setIsLoading(true);

		try {
			let data;
			if (orientationFilter) {
				data = await searchPhotos(searchTerm, page, orientationFilter);
			} else {
				data = await searchPhotos(searchTerm, page);
			}

			let filteredImages = data.results;

			// Apply a filter for images with over 500 likes (popular images)
			if (popularFilter) {
				filteredImages = filteredImages.filter((image: ImageType) =>
					image.likes && image.likes > 500
				);
			}

			if (page === 1) {
				// If it's the first page, replace the old images with the new ones.
				setImages(filteredImages);
			} else {
				// Otherwise, append to the existing images.
				setImages((prevImages) => [...prevImages, ...filteredImages]);
			}

			setTotalImages(data.total);

			// Update page count after a successful fetch
			setPage((prevPage) => prevPage + 1);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoadMore = (info: { distanceFromEnd: number }) => {
		if (!isLoading) {
			fetchData(); // Load more images for the active search
		}
	};

	const handleFilter = () => {
		// Reset everything before applying filters
		setImages([]);
		setPage(1); // Reset page count for the filtered search
		setTotalImages(0);
		fetchData(); // Call fetchData directly without setTimeout
	};

	const handleSearch = () => {
		// Reset everything before a new search
		setImages([]);
		setPage(1); // Reset page count for the new search
		setTotalImages(0);
		fetchData(); // Call fetchData directly without setTimeout
	};

	const slideIn = () => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
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
					onChangeText={(text) => setSearchTerm(text)}
				/>
				<Pressable style={styles.pressableButton} onPress={handleSearch}>
					<Text style={styles.buttonText}>Search</Text>
				</Pressable>
			</View>
			{/* Orientation filter dropdown */}
			<View style={styles.filterContainer}>
				<Text>Orientation Filter:</Text>
				<select
					value={orientationFilter}
					onChange={(e) => setOrientationFilter(e.target.value)}
					style={styles.filterSelect}
				>
					<option value="">No Filter</option>
					<option value="portrait">Portrait</option>
					<option value="landscape">Landscape</option>
					{/* Add more orientations */}
				</select>
			</View>
			{/* Popular filter checkbox */}
			<View style={styles.filterContainer}>
				<Text>Show Popular Images:</Text>
				<input
					type="checkbox"
					checked={popularFilter}
					onChange={() => setPopularFilter(!popularFilter)}
				/>
			</View>
			<Pressable style={styles.filterButton} onPress={handleFilter}>
				<Text style={styles.buttonText}>Filter</Text>
			</Pressable>
			<FlatList
				ref={flatListRef}
				data={images}
				keyExtractor={(item) => item.id}
				renderItem={renderImageItem}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.1}
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
		height: screenHeight > 600 ? 400 : 200,
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
	// Add styles for filter container and select
	filterContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 10,
	},
	filterTextInput: {
		flex: 1,
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginLeft: 10,
		paddingLeft: 8,
		borderRadius: 5,
	},
	filterSelect: {
		height: 40,
		width: 150,
		marginLeft: 10,
	},
	filterButton: {
		backgroundColor: 'blue',
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 5,
		marginVertical: 10,
	},
});

export default PhotoSearch;
