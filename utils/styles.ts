import { StyleSheet } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

export const lightTheme = {
    primary: '#6366F1',
    primaryLight: '#EEF2FF', // Alias rajouté
    secondary: '#06B6D4',
    secondaryLight: '#CFFAFE', // Alias rajouté
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    indigo50: '#EEF2FF',
    indigo100: '#E0E7FF',
    emerald100: '#D1FAE5',
    amber100: '#FEF3C7',
    tabBar: '#FFFFFF',
    isDark: false,
};

export const darkTheme = {
    primary: '#818CF8',
    primaryLight: '#312E81', // Alias rajouté
    secondary: '#22D3EE',
    secondaryLight: '#083344', // Alias rajouté
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    gray100: '#1E293B',
    gray200: '#334155',
    gray300: '#475569',
    gray400: '#64748B',
    gray500: '#94A3B8',
    indigo50: '#312E81',
    indigo100: '#3730A3',
    emerald100: '#064E3B',
    amber100: '#78350F',
    tabBar: '#1E293B',
    isDark: true,
};

export const useTheme = () => {
    const isDark = useThemeStore((state) => state.isDark);
    return isDark ? darkTheme : lightTheme;
};

// Ces constantes sont gardées pour compatibilité mais useTheme est recommandé
export const colors = lightTheme;

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        borderRadius: 28,
        padding: 24,
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        elevation: 5,
        borderWidth: 1,
    },
    button: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 2,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        fontWeight: '500',
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
});
