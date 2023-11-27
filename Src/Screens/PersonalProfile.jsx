
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity, Animated, Alert, TextInput, Platform, Dimensions, SafeAreaView, ScrollView, Linking } from 'react-native'//////
import React, { useState, useContext, } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext2 } from '../Context/ContextProvider';
// import { IsExistingUser } from '../../utils/IsExistingUser';

import * as ImagePicker from 'expo-image-picker';

import FloatingOptionPicker, { floatingOptionPicker } from '../Components/FloatingOptionPicker'
import ProfileStatistics from '../Components/ProfileStatistics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PersonalProfile() {
	const screenWidth = Dimensions.get('window').width;
	const navigation = useNavigation();
	const [Editing, SetEditing] = useState(false);
	const [hasAlerted, SetHasAlerted] = useState(false);

	const StartEdit = () => { SetEditing(true); Alert.alert("מצב עריכה") }
	const ConcludeEdit = () => {
		SetDatePickerSwitch(false);
		SetOptionPicker(false);
		SetEditing(false); Alert.alert("עריכה הסתיימה")
	}

	// const now = new Date();

	const {
		name, SetName,
		email, SetEmail,
		password, SetPassword,
		recycPrefs, SetRecycPrefs,
		residence, SetResidence,

		status, SetStatus,
		birthDate, SetBirthDate,
		profileImage, SetProfileImage,

		subscribeDate, SetSubscriberDate,

		currentUser, SetCurrentUser,
		handleActiveMember,

	} = useContext(UserContext2);


	const [textVisible, SetTextVisible] = useState(false);
	const timeRef = React.useRef(null);
	const [animatedFadeout] = useState(new Animated.Value(1));
	/////////// birthday date gadget thingie //////
	const [datePickerSwitch, SetDatePickerSwitch] = useState(false);
	const [optionPicker, SetOptionPicker] = useState(false);


	const dateEventChange = (event, selectedDate) => {
		const currentDate = selectedDate || new Date(birthDate);
		SetDatePickerSwitch(Platform.OS === 'ios');
		SetBirthDate(currentDate);
	}
	const formatDate = (date) => {
		if (!date) {
			console.log("No date provided");
			return 'לא ידוע';
		}
	
		let dateObj = new Date(date);
		console.log("Original date string:", date);
	
		if (isNaN(dateObj)) {
			console.log("DateObj is NaN");
			return 'נתון לקוי';
		}
	
		let formattedDate = dateObj.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
		console.log("\n\nFormatted date:", formattedDate);
		// console.log("currentUser.residence:", currentUser.residence);
		// console.log("currentUser.birthdate:", currentUser.birthDate);
		console.log("\n\n");


		return formattedDate;
	}

	const minAge = new Date(); minAge.setFullYear(minAge.getFullYear() - 8);
	const maxAge = new Date(); maxAge.setFullYear(maxAge.getFullYear() - 120);

	const handleLongPress = () => {
		SetTextVisible(true);
		animatedFadeout.setValue(1);
		if (timeRef.current) clearTimeout(timeRef.current)
		timeRef.current = setTimeout(() => {

			Animated.timing(
				animatedFadeout, {
				toValue: 0,
				duration: 3000,
				useNativeDriver: true,
			}
			).start(() => SetTextVisible(false))
		}, 3000);
	}
	const upsertUserDetails = async () => {
		console.log("Got into the upsert function on the PersonalProfile");

		const birthDateObj = new Date(birthDate);

		// if (birthDate != currentUser.birthDate)  updatedFields.birthDate = birthDate.toISOString();
		let updatedFields = {};

		// Check each field for changes and add to updatedFields if changed
		updatedFields.name = name;
		// updatedFields.name = (currentUser ? currentUser.name : name);

		updatedFields.email = email;
		updatedFields.recycPrefs = recycPrefs;
		updatedFields.residence =( currentUser ? currentUser.residence : residence);
		updatedFields.status = (currentUser ? currentUser.status : status);
		updatedFields.birthDate = birthDate || currentUser.birthDate;

		// if (residence != currentUser.residence) updatedFields.residence = residence;
		// if (currentUser.status !== status) updatedFields.status = status;

		// if (JSON.stringify(currentUser.residence) !== JSON.stringify(residence)) {
		// 	updatedFields.residence = residence;
		// }
		console.log("\nUpdated fields:", updatedFields);

		// if (profileImage && currentUser.profileImage !== profileImage) updatedFields.profileImage = profileImage.uri;

		if (profileImage) {
            if (typeof profileImage === 'string' && (profileImage.startsWith('http') || profileImage.match(/\.(jpeg|jpg|gif|png)$/))) {
                if (currentUser.profileImage !== profileImage) {
                    updatedFields.profileImage = profileImage;
                }
            } else {
                updatedFields.profileImage = {uri: profileImage.uri};
            }
        }

		if (Object.keys(updatedFields).length === 0) {
			console.log("No changes detected");
			return;
		}


		if (currentUser) {	//in case of existing user (insert)

			let requestBody = JSON.stringify({ email: currentUser.email });
			console.log("requestBody:", requestBody);
			console.log("Case of existing user: ", currentUser.email);
			let res = await fetch('https://recyclistserver-8c9b.onrender.com/api/users/returnId', {
				method: 'POST',
				headers: {
					Accept: "application/json",
					"Content-type": "application/json",
				},
				body: requestBody
			})
			let userIdResponse = await res.json();
			const userId = userIdResponse._id;
			console.log("\ndone fetching the Id: ", userId, ", now updating the changes - - ");

			res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/users/${userId}`, {
				method: 'PUT',
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedFields)
			})
				.then(resp => resp.json())
				.then(data => {
					console.log(data);
					navigation.goBack();
				})
				.catch(error => { console.error('error updating user:', error); });
		} else {
			let user = {
				profileImage: profileImage.base64,
				name,
				email,
				password,
				recycPrefs,
				birthDate,
				residence,
				status
			}
			console.log("Case of NEW  user: ", user.email);
			
			//////////////////////////////////////////////////////////////
			// navigation.navigate('Login');
			let res = await fetch('https://recyclistserver-8c9b.onrender.com/api/users/register', {
				method: 'POST',
				headers: {
					Accept: "application/json",
					"Content-type": "application/json",
				},
				body: JSON.stringify(user)
			})
				.then(resp => resp.json())
				.then(data => {
					console.log(data);
					// console.log(response.ok ? "User saved!" : "registration failure");
					navigation.navigate('Login');

				})
				.catch(error => { console.error('error registring user:', error); });
		}
	}
	async function HandleImageUpload() {
		// console.log("Image upload button");
		let { permissionStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
		if (permissionStatus !== 'granted' && !hasAlerted) {
			let perrmissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (perrmissionResult !== 'granted') {
				SetHasAlerted(true);
				Alert.alert(
					'יש צורך באישור גישה לרול מצלמה',
					'נא לאשר גישה לרול מצלמה בהגדרות הטלפון',
					[
						{ text: 'ביטול', onPress: () => console.log('Permission Denied'), style: 'cancel' },
						{ text: 'אפשרויות', onPress: () => Linking.openSettings() },
					]
				)
				return;
			}
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.1,
			base64: true,
		});
		if (!result.canceled) {
			SetProfileImage(result.assets[0]);
		}
		console.log(Object.keys(result.assets[0]));

	}



	// console.log(currentUser ? ("email of currentUser: ", currentUser.email, "\n") : "\nthere's no current DB registered user");
	return (
		<View style={styles.backgroundGradient}>
			<LinearGradient
				colors={['rgba(161, 178, 166, 0.75)', 'rgba(255, 255, 255, 0.00)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				locations={[0, 0.89]}
				style={styles.linearGradient}
			>
				<SafeAreaView>
					<ScrollView style={styles.container}>
						{/* logo and cogwheel */}
						<View style={[styles.title]}>
							<TouchableOpacity onPress={Editing ? ConcludeEdit : StartEdit} onLongPress={handleLongPress}>
								<Image source={require('../../assets/icons/SettingsCogwheel.png')} resizeMode='contain' />
								{
									textVisible &&
									<Animated.Text style={{ fontFamily: 'openSansReg', fontSize: 11, color: '#7394E7', opacity: animatedFadeout }}>עריכה</Animated.Text>
								}
							</TouchableOpacity>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<Image source={require('../../assets/icons/recycliSTLogo113.png')} style={styles.LogoImage} resizeMode='contain' />
							</TouchableOpacity>
						</View>
						{/* Image and Name */}

						<View style={[styles.wrapper, styles.ImageAndName,]}>
							<View style={[styles.profilePictureView]}>
								<Pressable style={[styles.changeProfilePicBtn]} onPress={() => HandleImageUpload()}>
									<Image source={require('../../assets/icons/EditProfileImageIcon.png')} />
								</Pressable>
								<View style={[styles.profilePicContainer]}>
									{/* {
										profileImage && profileImage !== ''
											? <Image source={{ uri: profileImage.uri }} style={[styles.ProfilePicture]} />
											: ((currentUser && currentUser.profileImage)
												? <Image source={currentUser.profileImage } style={[styles.ProfilePicture]} />
												: <Image source={require('../../assets/icons/profilePicture.png')} style={[styles.ProfilePicture]} />
											)
									} */}
									{
										currentUser
											? <Image source={{ uri: profileImage.uri }} style={[styles.ProfilePicture]} />
											: (profileImage && profileImage !== ''

												? <Image source={{ uri: profileImage.uri }} style={[styles.ProfilePicture]} />
												: <Image source={require('../../assets/icons/profilePicture.png')} style={[styles.ProfilePicture]} />
											)
									}
								</View>
							</View>
							<View style={[styles.nameAndGreeting]}>
								<Text style={{ fontFamily: 'openSansBold', fontSize: 14.5 }}>היי,
								{!currentUser ? name : currentUser.name}
								</Text>

								{
									currentUser
									? <Text style={{ fontFamily: 'openSansReg', fontSize: 12, color: '#7394E7' }}>חבר החל מ {formatDate(currentUser.subscribeDate)} </Text>
									: <Text style={{ fontFamily: 'openSansReg', fontSize: 12, color: '#7394E7' }}>חבר החל מ {formatDate(new Date())} </Text>
								}
								{/*
								<Text style={{ fontFamily: 'openSansReg', fontSize: 12, color: '#7394E7' }}>חבר החל מ
								 {subscribeDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })} {formatDate(currentUser.subscribeDate)}
								</Text>
								*/}
							</View>
						</View>

						{/* d */}
						<View style={[styles.formFieldsContainer, styles.wrapper]}>
							<View style={[styles.addressDetails, {}]}>


								<View style={[styles.addressDetail, { marginLeft: 15, }]}>
									<Pressable
										style={[styles.textBoxStyle, { width: 140, }]}
										onPress={() => navigation.navigate('DropDownScreen', { SetResidence })}
									>
										
										

										<Text style={styles.oSans12r}>
										{
											currentUser
											? currentUser.residence.city 
											: (residence.city || 'ישוב') 
										}	
											{/* {(!currentUser && residence.city !== 'ישוב') ? residence.city : (currentUser.residence.city || 'ישוב')} */}
										</Text>

									</Pressable>
									<Text style={styles.generalSubtitle}>ישוב</Text>
								</View>
								<View style={[styles.addressDetail, { marginLeft: 15, }]}>
									<Pressable
										style={[styles.textBoxStyle, { width: 140, }]}
										onPress={() => navigation.navigate('DropDownSearchStreet', { SetResidence })}>

										<Text style={styles.oSans12r}>
											{
												currentUser
													? currentUser.residence.street
													: (residence.street || 'רחוב')
											}
										</Text>
									</Pressable>
									<Text style={styles.generalSubtitle}>רחוב</Text>
								</View>
								<View style={[styles.addressDetail, { marginLeft: 15, }]}>
									<TextInput
										key={residence.streetNum}
										style={[styles.textBoxStyle, styles.oSans12r, { width: 30 }]}
										placeholder={(!currentUser && residence.streetNum !== '00') ? residence.streetNum : (currentUser ? currentUser.residence.streetNum.toString() :  (residence.streetNum || '00'))}
										value={residence.streetNum ? residence.streetNum.toString() : ''}
										editable={Editing}
										keyboardType='numeric'
										onChangeText={text => SetResidence(pervResidence => ({ ...pervResidence, streetNum: Number(text) }))}
									/>
									<Text style={styles.generalSubtitle}>מס׳</Text>
								</View>
							</View>
							{/** So far address View */}
							<View style={styles.personalDetails}>
								<View style={[styles.verticalFormItem, styles.dateItem]}>
									<Pressable
										style={[styles.textBoxStyle, { width: 210, height: 25 }]}
										onPress={() => { SetDatePickerSwitch(true); }}  //SetDatePressableOn(true); 
										disabled={!Editing}
									>
										
										<Text style={[styles.placeHolderText, { textAlign: 'center' }]}>
											
											{
												 currentUser ? formatDate(currentUser.birthDate) :
												 birthDate ? formatDate(birthDate) : 
												 'לא ידוע'
											}
										</Text>
										
										{(datePickerSwitch) &&
											(<DateTimePicker
												testID='dateTimePicker'

												value={birthDate || new Date()} 
												mode='date'
												display='default'
												onChange={dateEventChange}
												maximumDate={minAge}
												minimumDate={maxAge}
											/>
											)
										}
									</Pressable>
									<Text style={styles.generalSubtitle}>תאריך לידה</Text>
								</View>
								<View style={[styles.verticalFormItem]}>
									<Pressable
										style={[styles.textBoxStyle, { width: 210 }]}
										value={status}
										disabled={!Editing}
										onPress={() => SetOptionPicker(true)}
									>
										<Text style={[styles.placeHolderText, { textAlign: 'center' }]}>{!currentUser ? status : currentUser.status}</Text>
									</Pressable>
									<FloatingOptionPicker status={status} SetStatus={SetStatus} optionPicker={optionPicker} SetOptionPicker={SetOptionPicker} style={{ zIndex: 9999 }}
									/>

									<Text style={styles.generalSubtitle}>סטטוס אישי</Text>
								</View>
								
								<View style={[styles.verticalFormItem, { zIndex: 1 }]}>
									<TextInput
										style={[styles.textBoxStyle, { width: 210 }]}
										value={!currentUser ? password : currentUser.password}
										// placeholder={}

										editable={Editing}
										onChangeText={() => Alert.alert('TODO: change/reset password?')}
										secureTextEntry
									/>
									<Text style={styles.generalSubtitle}>סיסמה</Text>
								</View>

								{/*so the problem is not with the email... maybe the date thing  */}
								<View style={[styles.verticalFormItem, { zIndex: 1 }]}>
									<TextInput
										style={[styles.textBoxStyle, { width: 210 }]}
										value={email}
										placeholder={currentUser ? currentUser.email : email}
										editable={false}
										onChangeText={() => Alert.alert('TODO: should kept locked')}
									/>
									<Text style={styles.generalSubtitle}>אימייל</Text>
								</View>


							</View>
						</View>
						{
							currentUser &&
							<View style={styles.wrapper}>
								<Text style={[styles.generalSubtitle, { marginTop: 35, }]}>סטטיסטיקה</Text>
								<ProfileStatistics />
							</View>
						}

					</ScrollView>
				</SafeAreaView>

				<View style={styles.profileFooterPressable}>
					<TouchableOpacity style={[styles.footerTouchable, { width: screenWidth }]} onPress={() => upsertUserDetails()}>
						{
							currentUser
								? <Text style={styles.footerText}>עדכן - וחזור לאפליקציה :)</Text>
								: <Text style={styles.footerText}>סיים - ונכנס לאפליקציה :)</Text>
						}

					</TouchableOpacity>


				</View>
				{ }
			</LinearGradient>
		</View>
	)
}
const styles = StyleSheet.create({
	backgroundGradient: {
		flex: 1,
	},
	container: {
		flex: 21,
	},
	linearGradient: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
	},
	LogoImage: {
		width: 60,
	},
	title: {
		flexDirection: 'row-reverse',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: 330,
	},
	wrapper: {},
	ImageAndName: {},
	profilePictureView: {
		flex: 7, 		// zIndex: -10, // marginTop:-20,
		alignItems: 'center',
		padding: 0,
	},
	nameAndGreeting: {
		flex: 3,
		alignItems: 'center',
	},
	changeProfilePicBtn: {
		zIndex: 3,
		width: 30,
		top: 32,
		left: 32,
		backgroundColor: 'rgba(255, 255, 255, 0.01)', // Transparent background

		elevation: 5, //for android
		shadowColor: '#000',
		shadowOffset: { width: -3, height: 3 },//bottom left below this
		shadowOpacity: 0.55,
		shadowRadius: 3.84,
	},
	profilePicContainer: {
		width: 90,
		height: 90,
		overflow: 'hidden',
		borderRadius: 100,
		backgroundColor: '#6D8FE6',
		padding: 0,
		margin: 0,
	},
	ProfilePicture: {
		flex: 1,
		width: 90,
		// top: 0,
		resizeMode: 'cover',
	},
	formFieldsContainer: {
		flex: 21,
		flexDirection: "column",
		flexWrap: 'wrap-reverse',
		alignItems: 'center'
	},
	addressDetails: {
		marginTop: 15,
		flexDirection: 'row-reverse',
		justifyContent: 'space-between',
		flex: 10,
	},
	addressDetail: {
		textAlign: 'right',
		alignItems: 'flex-end',
		flexDirection: 'column',
	},
	textBoxStyle: {
		height: 25,
		justifyContent: 'center',
		backgroundColor: '#d9d9d9',
		padding: 1,
		textAlign: 'right',
		borderColor: '#ccc',
		borderWidth: 1,
		fontFamily: 'openSansReg',
	},
	personalDetails: {},
	floatingOptionPicker: {
		position: 'absolute',
		zIndex: 9999,
		bottom: 300,
		left: 30,
		backgroundColor: 'white',
		width: '80%',
		alignSelf: 'center',
	},
	verticalFormItem: {
		zIndex: 2,
		flexDirection: 'row',
		textAlign: 'right',
		justifyContent: 'flex-end',
		justifyContent: 'space-between',
		marginTop: 30,
	},
	profileFooterPressable: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
	},
	footerTouchable: {
		backgroundColor: '#6D8FE6',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 30,
	},
	footerText: {
		fontFamily: 'openSansBold',
		color: '#fff'
	},
	oSans12r: {
		textAlign: 'right',
		fontFamily: 'openSansReg',
		fontSize: 12,
	},
	generalSubtitle: {
		textAlign: 'right',
		fontFamily: 'openSansBold',
		fontSize: 13,
	},
	placeHolderText: {
		fontFamily: 'openSansReg',
		fontSize: 12,
	},
})

