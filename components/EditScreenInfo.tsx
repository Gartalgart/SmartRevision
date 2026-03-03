import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/styles';

export default function EditScreenInfo({ path }: { path: string }) {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text style={[styles.getStartedText, { color: theme.textSecondary }]}>
          Ouvrez le code de cet écran :
        </Text>

        <View style={[styles.codeHighlightContainer, { backgroundColor: theme.indigo50 }]}>
          <Text style={[styles.homeScreenFilename, { color: theme.text }]}>{path}</Text>
        </View>

        <Text style={[styles.getStartedText, { color: theme.textSecondary }]}>
          Modifiez le code et voyez les changements en direct.
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <TouchableOpacity onPress={() => {}} style={styles.helpLink}>
          <Text style={[styles.helpLinkText, { color: theme.primary }]}>
            Besoin d'aide ?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
    marginVertical: 7,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
