import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Icon } from 'react-native-boxes';

export type searchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    iconName?: string;
};

export function CustomSearchBar({
    value,
    onChangeText,
    placeholder,
    iconName,
}: searchBarProps) {
    return (
        <View style={styles.container}>
            {iconName && (
                <Icon
                    name={iconName}
                    size={15}
                    color="#999"
                    style={styles.icon}
                />
            )}

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6FA',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    icon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        fontSize: 13,
        color: '#000',
    },
});