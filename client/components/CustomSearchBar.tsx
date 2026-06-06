import react from 'react';
import { View, Text, ViewStyle, StyleProp, TextInput } from 'react-native'
import { Icon } from 'react-native-boxes';
import { useState } from 'react';

export type searchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
    iconName?: string;
    
};




export function CustomSearchBar(props: searchBarProps) {
    return (
        <View
            style={[
                {
                    flexDirection: 'row',

                    alignItems: 'center',
                    backgroundColor: '#F5F6FA',
                    borderRadius: 12,
                    
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,


                },
                props.style
            ]}
        >
            {props.iconName && (
                <Icon
                    name={props.iconName}
                    size={15}
                    color="#999"
                    style={{ marginRight: 10 }}
                />
            )}
            <TextInput
                underlineColorAndroid="transparent"
                value={props.value}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
                placeholderTextColor="#999"
                style={{
                    flex: 1,
                    fontSize: 13,
                    outlineWidth:0,
                    // @ts-ignore
                    outline:'none',
                    color: '#000',

                }}
            />
        </View>
    )
}