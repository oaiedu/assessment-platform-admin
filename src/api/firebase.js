/**
 * Gets the Firebase config according to the app mode.
 *
 * @returns An object that keeps all of the firebase configuration.
 */
export const getConfig = () => {
  const prodConfig = {
    apiKey: "AIzaSyAXJ3DvXmuoxq4BREOl8pymt6t8NJnX6TA",
    authDomain: "cloud-quiz-generator.firebaseapp.com",
    projectId: "cloud-quiz-generator",
    storageBucket: "cloud-quiz-generator.appspot.com",
    messagingSenderId: "684103556095",
    appId: "1:684103556095:web:30fcc211c80a15af86e5ca",
    measurementId: "G-E4CRZVV3K9"
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
