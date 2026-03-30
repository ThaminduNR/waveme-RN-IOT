import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    NavigationProp,
    RouteProp,
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CommonHeader from '../components/CommonHeader';
import CommonTextInput from '../components/TextInput';
import CommonButton from '../components/CommonButton';
import { verifyResetCode } from '../services/authService';
import { getErrorMessage } from '../utils/apiError';

type EnterCodeRouteProp = RouteProp<RootStackParamList, 'EnterCode'>;

const EnterCodeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<EnterCodeRouteProp>();
    const email = route.params.email;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        const trimmed = code.trim();
        if (!trimmed) {
            Alert.alert('Missing code', 'Please enter the code from your email.');
            return;
        }
        if (loading) {
            return;
        }
        setLoading(true);
        try {
            await verifyResetCode(email, trimmed);
            navigation.navigate('EnterNewPassword', { email, code: trimmed });
        } catch (e) {
            Alert.alert('Invalid code', getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CommonHeader onBackPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Enter Code</Text>
                    <Text style={styles.subtitle}>Welcome back to WaveMe</Text>

                    <View style={styles.form}>
                        <CommonTextInput
                            label="Enter your Code"
                            placeholder="Code"
                            value={code}
                            onChangeText={setCode}
                        />
                    </View>

                    <View style={styles.spacer} />

                    <View style={styles.buttonWrap}>
                        <CommonButton
                        title={loading ? 'Verifying…' : 'Continue'}
                        variant="gradient"
                        onPress={handleContinue}
                    />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EnterCodeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    keyboardView: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#9a9a9a',
        marginBottom: 28,
    },
    form: {
        marginBottom: 16,
    },
    spacer: {
        flex: 1,
    },
    buttonWrap: {
        alignItems: 'center',
    },
});
