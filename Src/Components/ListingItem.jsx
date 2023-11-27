import { Text, TouchableOpacity, Image, View, StyleSheet  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ContextMenu from './ContextMenu';

import { UserContext2 } from '../Context/ContextProvider';
import React, { useState, useContext } from 'react';

const ListingsItem = ( {_id, listName, pinned, listColor}) => {
	const { currentUser, SetCurrentUser } = useContext(UserContext2);

	const navigation = useNavigation();
	
	const headerId = _id;
	console.log(headerId);
	return (
		<TouchableOpacity onPress={(event) => {
			event.stopPropagation();
			navigation.navigate('ListScreen', { headerId }); 
		}}
			style={[styles.listsItem, { borderColor: listColor }]}
		>
			{//TODO: add the pinned to the top of the list...
				pinned &&  <Image source={require('../../assets/icons/pinned.png')} style={{ marginRight: 10 }} />
			}
			<Text style={[{fontFamily: 'openSansReg'}, styles.textStyle,  ]}>{listName || "רשימה חדשה"}</Text>

			<ContextMenu headerId={headerId}/>
		</TouchableOpacity>
	)
}
const styles = StyleSheet.create({

	textStyle: {
		flex: 1,
		textAlign: 'right',
		fontSize: 16,
		marginRight: 10,
	},
	menuTrigger: {
		paddingVertical:15,
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
	listsItem: {
		marginTop: 16,
		borderRadius: 5,

		backgroundColor: "#FFFEFE",
		borderWidth: 2,
		height: 40,

		flexDirection: 'row-reverse',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
export default ListingsItem;