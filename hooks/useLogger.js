import { Alert } from 'react-native';

export function useLogger() {
  const logError = (error, context = 'Unknown') => {
    Alert.alert(
      'Caught Error',
      `${context}\n\n${error?.message || error}\n\n${error?.stack || ''}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );

    console.log('Logged error:', error);
  };

  const withTryCatch = (fn, context) => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (e) {
        logError(e, context);
      }
    };
  };

  return {
    logError,
    withTryCatch,
  };
}
