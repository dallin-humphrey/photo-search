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
	Switch,
} from 'react-native';
import { searchPhotos } from '../api/unsplashApi';
import { Picker } from '@react-native-picker/picker';

// Get the screen height for image rendering
const { height: screenHeight } = Dimensions.get('window');

// Define the type for images
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

// Main component for photo search
const PhotoSearch = () => {
	// State variables
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [images, setImages] = useState<ImageType[]>([]);
	const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [totalImages, setTotalImages] = useState<number>(0);
	const [page, setPage] = useState<number>(1); // Current page for the active search
	const [orientationFilter, setOrientationFilter] = useState<string>(''); // TODO: Fix the error here
	const [popularFilter, setPopularFilter] = useState<boolean>(false);
	const [colorFilter, setColorFilter] = useState<string>(''); // TODO: Fix the error here

	// Animation and ref
	const slideAnim = useRef(new Animated.Value(1000)).current;
	const flatListRef = useRef<FlatList<ImageType> | null>(null);

	// Fetch data from the API
	const fetchData = async (newSearch = false): Promise<void> => {
		if (isLoading) {
			return;
		}

		setIsLoading(true);

		try {
			let data;
			if (orientationFilter) {
				// Include the color filter parameter when making the API request
				data = await searchPhotos(
					searchTerm,
					newSearch ? 1 : page,
					orientationFilter,
					colorFilter // TODO: Fix the error here
				);
			} else {
				data = await searchPhotos(searchTerm, newSearch ? 1 : page, '', colorFilter); // TODO: Fix the error here
			}

			// Filter images based on likes and orientation
			let filteredImages = data.results;
			if (popularFilter) {
				filteredImages = filteredImages.filter((image: ImageType) => image.likes && image.likes > 500);
			}

			if (orientationFilter === 'landscape') {
				filteredImages = filteredImages.filter((image: ImageType) => image.width && image.height && image.width > image.height);
			} else if (orientationFilter === 'portrait') {
				filteredImages = filteredImages.filter((image: ImageType) => image.width && image.height && image.height > image.width);
			}

			// Update state based on whether it's a new search or not
			if (newSearch) {
				setImages(filteredImages);
				setPage(1);
			} else {
				setImages((prevImages) => [...prevImages, ...filteredImages]);
				setPage((prevPage) => prevPage + 1);
			}

			setTotalImages(data.total);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Load more images when reaching the end of the list
	const handleLoadMore = (info: { distanceFromEnd: number }) => {
		if (!isLoading) {
			fetchData();
		}
	};

	// Apply filters and fetch data
	const handleFilter = () => {
		setImages([]);
		setPage(1);
		setTotalImages(0);
		fetchData();
	};

	// Handle search action
	const handleSearch = () => {
		setImages([]);
		setPage(1);
		setTotalImages(0);
		fetchData(true);
	};

	// Animate the selected image into view
	const slideIn = () => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};

	// Animate the selected image out of view
	const slideOut = () => {
		Animated.timing(slideAnim, {
			toValue: 1000,
			duration: 500,
			useNativeDriver: true,
		}).start(() => setSelectedImage(null));
	};

	// Update animation when a new image is selected
	useEffect(() => {
		if (selectedImage) {
			slideIn();
		}
	}, [selectedImage]);

	// Handle image press to select an image
	const onImagePress = (item: ImageType) => {
		setSelectedImage(item);
	};

	// Render each image item
	const renderImageItem = ({ item }: { item: ImageType }) => (
		<Pressable onPress={() => onImagePress(item)}>
			<Image style={styles.image} source={{ uri: item.urls.small }} />
		</Pressable>
	);

	// Handle scroll events for animation
	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		Animated.event(
			[{ nativeEvent: { contentOffset: { y: slideAnim } } }],
			{ useNativeDriver: false }
		)(event);
	};

	// Main render function
	return (
		<SafeAreaView style={styles.container}>
			{/* Search bar */}
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
			{/* Filters */}
			<View style={styles.filterContainer}>
				<Text>Orientation Filter:</Text>
				{/* Replaced with a native React Native component */}
				<Picker
					selectedValue={orientationFilter}
					onValueChange={(itemValue) => setOrientationFilter(itemValue)}
					style={styles.filterSelect}
				>
					<Picker.Item label="No Filter" value="" />
					<Picker.Item label="Portrait" value="portrait" />
					<Picker.Item label="Landscape" value="landscape" />
				</Picker>
			</View>
			<View style={styles.filterContainer}>
				<Text>Color Filter:</Text>
				{/* Replaced with a native React Native component */}
				<Picker
					selectedValue={colorFilter}
					onValueChange={(itemValue) => setColorFilter(itemValue)}
					style={styles.filterSelect}
				>
					<Picker.Item label="No Filter" value="" />
					<Picker.Item label="Black & White" value="black_and_white" />
					<Picker.Item label="Black" value="black" />
					<Picker.Item label="White" value="white" />
					<Picker.Item label="Yellow" value="yellow" />
					<Picker.Item label="Orange" value="orange" />
					<Picker.Item label="Red" value="red" />
					<Picker.Item label="Purple" value="purple" />
					<Picker.Item label="Magenta" value="magenta" />
					<Picker.Item label="Green" value="green" />
					<Picker.Item label="Teal" value="teal" />
					<Picker.Item label="Blue" value="blue" />
				</Picker>
			</View>
			<View style={styles.filterContainer}>
				<Text>Show Popular Images:</Text>
				{/* Replaced with a native React Native component */}
				<Switch
					value={popularFilter}
					onValueChange={() => setPopularFilter(!popularFilter)}
				/>
			</View>
			<Pressable style={styles.filterButton} onPress={handleFilter}>
				<Text style={styles.buttonText}>Filter</Text>
			</Pressable>
			{/* Image list */}
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
			{/* Selected image details */}
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
