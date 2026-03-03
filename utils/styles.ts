import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#5E60CE', // Un violet/indigo plus profond et moderne
    primaryLight: '#E0E7FF',
    secondary: '#48CAE4', // Un bleu-vert très frais
    success: '#2DC653', // Vert plus vif "façon Duolingo"
    warning: '#FF9F1C',
    danger: '#EF233C',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#2B2D42', // Noir plus doux
    textSecondary: '#8D99AE',
    border: '#EDF2F4',
    gray100: '#F4F5F7',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    indigo50: '#F0F4F8',
    indigo100: '#E0E7FF',
    emerald100: '#D8F3DC',
    amber100: '#FFF3CD',
};

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 28, // Plus arrondi
        padding: 24,
        shadowColor: '#8D99AE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
    },
    button: {
        height: 60, // Légèrement plus grand
        borderRadius: 20, // Plus arrondi
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800', // Plus gras
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 2, // Bordure plus épaisse au repos
        borderColor: colors.gray200,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    inputError: {
        borderColor: colors.danger,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.danger,
        marginTop: 6,
        marginLeft: 4,
    },
});
