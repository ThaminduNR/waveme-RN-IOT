import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

type CommonTextInputProps = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
} & Omit<TextInputProps, 'placeholder' | 'value' | 'onChangeText' | 'style'>;

const CommonTextInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    ...rest
}: CommonTextInputProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#8a8a8a"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize={secureTextEntry ? 'none' : 'words'}
                autoCorrect={false}
                {...rest}
            />
        </View>
    );
};

export default CommonTextInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'transparent',
        borderRadius: 50,
        height: 60,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
});
