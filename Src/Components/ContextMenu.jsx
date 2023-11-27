import { View, Text, StyleSheet, Image, Alert } from 'react-native'
import React, { useState, useContext } from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Dialog from 'react-native-dialog';


import { UserContext2 } from '../Context/ContextProvider';
// iŹport { TextInput } from 'react-native-gesture-handler';

export default function ContextMenu({headerId}) {
	const [showPrompt, SetShowPrompt] = useState(false);
	const [inputText, SetInputText] = useState('');
    const [promptSubmit, setPromptSubmit] = useState(() => () => {});	
	const { currentUser, SetCurrentUser, handleActiveMember, shoppingLists } = useContext(UserContext2);

	const currentUserId = currentUser._id;
	const collectionName = `${headerId}_${currentUserId}`;

	
	
	const togglePinned = async () => {
		let toggleParams = { headerId, paramName: "pinned" };
		console.log("toggling pinned; parameters: ", toggleParams);
		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/${collectionName}/toggleParam`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify(toggleParams)
		})
			.then(resp => resp.json())
			.then(data => {
				console.log(data);
			})
			.catch(error => { console.error('error toggling pinned list:', error); });
	}

	const dropListing = async (collectionName) => {
		console.log(collectionName);
		try {
			const response = await fetch(`http://localhost:5500/api/shoppinglist/${collectionName}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			});
			const data = await response.json();
			console.log('Delete response:', data);
			// Handle the response (e.g., update state, show a message, etc.)
		} catch (error) {
			console.error('Error deleting listing:', error);
			// Handle the error
		}
	}





//'/:collectionName/duplicateList'
    const duplicateListing = async (nameExt) => {
		console.log("List(collection) duplication..");
		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/${collectionName}/duplicateList`, {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify(nameExt)
		})
		.then(resp => resp.json())
			.then(data => {
				console.log(data);
			})
			.catch(error => { console.error('error duplicating list:', error); });
	}
	const renameListing = async (newName) => {
		console.log("renaming list collection..");
		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/${collectionName}/renameListing`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify(newName)
		})
			.then(resp => resp.json())
			.then(data => {
				console.log(data);
			})
			.catch(error => { console.error('error duplicating list:', error); });
	}
	const emailShareList=async(emailAdress)=>{
		console.log("Emailing List...");
		let res = await fetch(`https://recyclistserver-8c9b.onrender.com/api/shoppinglist/${collectionName}/mailListing`, {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify(emailAdress)
		})
		.then(resp => resp.json())
			.then(data => {
				console.log(data);
				log("Mail was sent to ", emailAdress)
			})
			.catch(error => { console.error('error emailing list:', error); });
	}

	const closePromptBox = () => {
		SetInputText('');
		SetShowPrompt(false);
	};
	const duplicateExtInput =()=>{
		SetPromptSubmit((input)=>{
			duplicateListing(input);
			console.log("Duplicated with the ext: ", input);
		});
		SetShowPrompt(true);
	}
	const renameNameInput=()=>{
		SetPromptSubmit((input)=>{
			renameListing(input);
			console.log("Renamed to: ", input);
		})
		SetShowPrompt(true);
	}
	const emailAddressInput=()=>{
		SetPromptSubmit((input)=>{
			emailShareList(input);
			console.log("emailing to: ", input);
		})
		SetShowPrompt(true);
	}
	
	
	const submitPromptBox = () => {
		const passingRegex = inputText.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|^[a-zA-Z0-9._-]+$/);
		if (passingRegex && promptSubmit && typeof promptSubmit === 'function') {
			console.log("User input:", inputText);
			promptSubmit(inputText);
			setDialogVisible(false);
			SetInputText('');
		}
		else { 
			Alert.alert("מחרוזת לא חוקית");
			SetInputText(''); 
		}
	};


	return (
		<View>
			<Dialog.Container visible={showPrompt}>
				<Dialog.Title>אותיות וספרות ללא רווחים</Dialog.Title>
				<Dialog.Input
					onChangeText={(text) => SetInputText(text)}
					value={inputText} />
				<Dialog.Button label='בטל' onPress={closePromptBox} />
				<Dialog.Button label='אשר' onPress={submitPromptBox} />
			</Dialog.Container>

			<Menu>
				<MenuTrigger>
					<Image source={require('../../assets/icons/threeDotsIcon.png')} resizeMode='contain' style={styles.menuTrigger} />
				</MenuTrigger>
				<MenuOptions customStyles={{
					optionsContainer: {
						width: 300,
						minHeight: 600,
					}
				}}>
					<MenuOption>
						<Text style={{ fontWeight: 'bold', padding: 10, textAlign: 'right', backgroundColor: "#ddd", }}>סגור</Text>
					</MenuOption>
					<MenuOption value="togglePin" onSelect={togglePinned}>
						<View style={styles.ContextMenuItem}>
							<Image source={require('../../assets/icons/pinned.png')} style={{ marginLeft: 8, paddingTop: 10 }} />
							<Text>הסר/הוסף נעוץ</Text>
						</View>
					</MenuOption>
					<MenuOption value={collectionName} onSelect={dropListing}>
						<View style={styles.ContextMenuItem}>
							<Image source={require('../../assets/icons/dropListing.png')} style={{ marginLeft: 8 }} />
							<Text>מחק</Text>
						</View>
					</MenuOption>
					<MenuOption value="duplicatelisting" onSelect={duplicateExtInput}>
						<View style={styles.ContextMenuItem}>
							<Image source={require('../../assets/icons/duplicateListing.png')} style={{ marginLeft: 8 }} />
							<Text>שכפל רשימה</Text>
						</View>
					</MenuOption>
					{/* Dialog POPS HERE */}
					<MenuOption value="renameListing" onSelect={renameNameInput}>
						<View style={styles.ContextMenuItem}>
							<Image source={require('../../assets/icons/renameListing.png')} style={{ marginLeft: 8 }} />
							<Text>שנה את שם הרשימה</Text>
						</View>
					</MenuOption>
					{/** (MAIL) OPTION not linked it yet */}
					<MenuOption value="shareMail" onSelect={emailAddressInput}>
						<View style={styles.ContextMenuItem}>
							<Image source={require('../../assets/icons/mailShare.png')} style={{ marginLeft: 8 }} />
							<Text>שתף (במייל)</Text>
						</View>
					</MenuOption>
				</MenuOptions>
			</Menu>
		</View>
	)

}

const styles = StyleSheet.create({
	menuTrigger: {
		paddingVertical: 15,
		marginLeft: 10
	},
	contextMenuFrame: {
	},
	ContextMenuItem: {
		flexDirection: 'row-reverse',
		padding: 10.9,
		borderColor: "#fff",
		borderBottomColor: "#999",
		borderWidth: 1,
	},
});


// switch  (value) {
	
// 		// case 'duplicatelisting':{
// 		// 	duplicateListing
// 		// 	//add code to ask the user for extention, maybe something like prompt
// 		// }
// 		// 	//goto server and run that option
// 		// 	Alert.alert("TODO: duplicatelisting");
// 		// 	break;
// 		case 'renameListing':
// 			//goto server and run that option
// 			Alert.alert("TODO: rename that listing");
// 			break;
// 		case 'shareMail':
// 			//goto server and run that option
// 			Alert.alert("TODO: share list");
// 			break;
// 	}








// const dropListing = async () => {
// 	let collection = { collectionName };
// 	console.log("within contextMenu dropping/deleting ", collection);
// 	//http://localhost:5500/shoppinglist
// 	try {
// 		let res = await fetch(`http://localhost:5500/api/shoppinglist/`, {
// 			method: 'DELETE',
// 			headers: {
// 				"Content-type": "application/json",
// 			},
// 			body: JSON.stringify(collection)
// 		})
// 		if (!res.ok) { throw new Error(`HTTP error: ${res.status}`) }
// 		if (res.status !== 204) {
// 			let data = await res.json();
// 			console.log(data);
// 		}
// 	} catch (error) {
// 		console.error('error deleting list:', error);
// 	}
// }

