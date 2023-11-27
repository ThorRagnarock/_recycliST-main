import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, SafeAreaView, Dimensions, ScrollView, Animated, Easing } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { UserContext2 } from '../Context/ContextProvider';
import { MenuProvider } from 'react-native-popup-menu'; ///
import HamburgerMenu from '../Components/HamburgerMenu';
import ListingsItem from '../Components/ListingItem';

export default function ListsMan() {
	const { currentUser, SetCurrentUser, newListingsData, SetNewListingsData } = useContext(UserContext2);
	console.log("Got into the ListsMan...");

	const currentUserLists = currentUser.shoppingLists;
	// const [newListingsData, SetNewListingsData] = useState([]);

	const retrieveListings = async () => {
		const headerIds = currentUser?.shoppingLists;
		const userId = currentUser?._id;

		console.log("fetching listings for rendering...");
		console.log("\nthis user's Id: ", userId, "\nUser's list's headerId's: ", headerIds);

		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/lists`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: userId, rawHeaderIds: currentUser.shoppingLists })
		})
			.then(response => response.json())
			.then(data => {
				SetNewListingsData(data)
			})
			.catch(error => console.error('Error:', error));
	}
	
	useEffect(() => {
		retrieveListings();
	}, [currentUser]);

	const screenWidth = Dimensions.get('window').width;
	const navigation = useNavigation();

	const [searchValue, SetSearchValue] = useState('');
	const [addListName, SetAddListName] = useState('');

	const [toggleAdd_Search, SetToggleAdd_Search] = useState(true);
	const [drawerPositon, SetDrawerPosition] = useState(new Animated.Value(-300));	//DRAWER INITIAL POSITION

	const toggleDrawer = () => {
		const toValue = drawerPositon._value === 0 ? -300 : 0;
		Animated.timing(drawerPositon, {
			toValue,
			duration: 150, 															//VELOCITY???
			easing: Easing.inOut(Easing.ease),  // Add this line
			useNativeDriver: false,
		}).start();
	};
	// const FetchSearchResutlts = (searchValue) => { Alert.alert('TODO:fetch resluts of ', searchValue) }
	const CreateNewListing = (addListName) => {
		Alert.alert(
			'רשימה חדשה',
			`האם ליצור את רשימה ${addListName}?`,
			[
				{
					text: 'בטל',
					style: 'cancel',
				},
				{
					text: 'אשר',
					onPress: () => {
						//HERE I AM CALLING TO THE CREATING FUNCTION
						addListingItem(addListName);
						Alert.alert(`רשימה ${addListName} נוצרה`);
						//TODO: ADD NEW LISTING TO THE DB - - maybe I should do up to 128 listings?
					},
				},
			]
		)
		SetAddListName('');//Nullifies the entry field
	}
	const addListingItem = async (addListName) => {
		let newListDetails = { userID: currentUser?._id, listingHeader: addListName, listColor: "#D9D9D9" }
		console.log("Creating new listing...: ", newListDetails);
		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/createList`, {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify(newListDetails)
		})
			.then(resp => resp.json())
			.then(data => {
				console.log("Response data:", data);
			})
			.catch(error => {
				console.error('error creating new list:', error);
			});
	}
	return (
		<View style={{ flex: 1, }}>
			<LinearGradient
				colors={['rgba(161, 178, 166, 0.75)', 'rgba(255, 255, 255, 0.00)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				locations={[0, 0.89]}
				style={styles.linearGradient}
			>
				<SafeAreaView style={styles.container}>
					<ScrollView>
						<View style={styles.title}>
							<View style={[styles.listSearch]}>
								<TouchableOpacity onPress={toggleDrawer}>
									<Image source={require('../../assets/icons/hambungerIcon.png')} resizeMode='contain' />
								</TouchableOpacity>
							</View>
							<Text style={{ fontFamily: 'openSansReg', fontSize: 14 }}>היי,
								{currentUser.name}
							</Text>
							<Image source={require('../../assets/icons/recycliSTLogo113.png')} style={{ width: 60 }} resizeMode='contain' />
						</View>
						<View>
							{ }
							<View style={styles.searchAndAddBar}>
								{
									toggleAdd_Search ?
										(
											<View style={styles.listSearch}>
												<Image source={require('../../assets/icons/magnifingGlassSearch.png')} style={{ marginRight: 10, }} />
												<TextInput
													style={[styles.listsSearchBar, { fontFamily: 'openSansReg' }]}
													value={searchValue}
													onChangeText={(searchValue) => { SetSearchValue(searchValue) }}
													placeholder='חפש רשימות'
													placeholderTextColor="#000"
												/>
											</View>
										)
										:
										( //Add a new listing 
											<View style={styles.listSearch}>
												<TextInput
													style={[styles.listsSearchBar, { paddingRight: 8 }]}
													value={addListName}
													onChangeText={(addListName) => { SetAddListName(addListName) }}
													placeholder='הוסף רשימה'
													placeholderTextColor="#000"
												/>
												<TouchableOpacity onPress={() => CreateNewListing(addListName)}>
													<Image source={require('../../assets/icons/addListDocument.png')} style={[{ width: 24, marginLeft: 8, marginRight: 10 }]} resizeMode='contain' />
												</TouchableOpacity>
											</View>
										)
								}
							</View>
							<MenuProvider customStyles={{ menuProviderWrapper: [{ height: 350 }] }} skipInstanceCheck>
								<SafeAreaView style={[{ flex: 14, marginTop: 50 }]}>
									<View>
										
										{
											newListingsData && newListingsData.length > 0
												? (newListingsData.map((listing, index) => (
													<ListingsItem key={index} {...listing} />
												)))
												: (<View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
													<Text>אנא הכנס רשימה חדשה</Text>
												</View>)
										}
									</View>
								</SafeAreaView>
							</MenuProvider>
						</View>
					</ScrollView>

				</SafeAreaView>

				<Animated.View
					style={{
						position: 'absolute',
						left: drawerPositon,
						top: 0,
						bottom: 0,
						width: 300,
						backgroundColor: 'grey',
					}}
				>
					<HamburgerMenu />
				</Animated.View>

				<View style={[styles.profileFooterPressable, { width: screenWidth }]}>
					<TouchableOpacity onPress={() => DeleteListing(currListHeaderID, listName)}>
						<Image source={require('../../assets/icons/garbageCanWhite.png')} resizeMode='contain' />
					</TouchableOpacity>


					<TouchableOpacity onPress={() => navigation.navigate('ListsMan')}>
						<Image source={require('../../assets/icons/HomeWhite.png')} resizeMode='contain' />
					</TouchableOpacity>

					<TouchableOpacity onPress={() => SetToggleAdd_Search(prevState => !prevState)}>
						{
							toggleAdd_Search
								? <Image source={require('../../assets/icons/PlusWhiteCircle.png')} resizeMode='contain' />
								: <Image source={require('../../assets/icons/whiteMagGlass.png')} resizeMode='contain' />
						}
					</TouchableOpacity>

				</View>
			</LinearGradient>
		</View>
	)
}
const styles = StyleSheet.create({
	container: {}, backgroundGradient: {}, LogoImage: {}, inlineImage: {}, listsUtils: {},

	linearGradient: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
	},
	title: {
		flexDirection: 'row-reverse',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: 330,
	},
	listSearch: {
		flexDirection: 'row-reverse',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	listsSearchBar: {
		flex: 1,
		textAlign: 'right',
		fontSize: 16,
		// fontFamily: 'openSansReg',
		marginRight: 5,
	},
	searchAndAddBar: {
		backgroundColor: "#F3F3F3",
		borderColor: "#F3F3F3",
		borderWidth: 2,
		height: 40,
		justifyContent: 'center',
	},
	
	profileFooterPressable: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		backgroundColor: '#6D8FE6',
		padding: 20,
		////////////////
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
	},
})
