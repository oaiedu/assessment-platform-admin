/**
 * Gets the Firebase config according to the app mode.
 *
 * @returns An object that keeps all of the firebase configuration.
 */
export const getConfig = () => {
  const prodConfig = {
    apiKey: "AIzaSyBBulAjoVwdI1CaK1GFCr1gh0F5JBniZoM",
    authDomain: "develop-lg-quiz-generator.firebaseapp.com",
    projectId: "develop-lg-quiz-generator",
    storageBucket: "develop-lg-quiz-generator.appspot.com",
    messagingSenderId: "149140593266",
    appId: "1:149140593266:web:a16dec7371623437dac0eb",
    measurementId: "G-18JVW1N909"
  };

  const devConfig = {
    apiKey: "AIzaSyBBulAjoVwdI1CaK1GFCr1gh0F5JBniZoM",
    authDomain: "develop-lg-quiz-generator.firebaseapp.com",
    projectId: "develop-lg-quiz-generator",
    storageBucket: "develop-lg-quiz-generator.appspot.com",
    messagingSenderId: "149140593266",
    appId: "1:149140593266:web:a16dec7371623437dac0eb",
    measurementId: "G-18JVW1N909"
  };

  return process.env.NODE_ENV === "production" ? prodConfig : devConfig;
};
