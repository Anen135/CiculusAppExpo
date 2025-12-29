import { Alert, Platform } from 'react-native';

export function useGlobalErrorLogger() {
  if (__DEV__) return;

  // Перехват JS ошибок
  const defaultHandler =
    global.ErrorUtils.getGlobalHandler &&
    global.ErrorUtils.getGlobalHandler();

  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert(
      'Error',
      `${error?.message}\n\n${error?.stack}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );

    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });

  // Перехват unhandled promise rejection
  if (Platform.OS === 'android') {
    const rejectionHandler = (event) => {
      Alert.alert(
        'Unhandled Promise',
        JSON.stringify(event.reason, null, 2)
      );
    };

    global.onunhandledrejection = rejectionHandler;
  }
}
