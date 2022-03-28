import { Store } from "vuex";
import axios from "axios";

import { analytics, auth, db, googleProvider, storage } from "../../main";
import { getNowISOString } from "../../utils/date";
import { createErrorLog, showErrorMessage } from "../../utils/errors";

/**
 * @typedef {import('./tests.store.js').Attempt} Attempt
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} id Represents the user Firestore id.
 * @property {string} name Defines the user name.
 * @property {string} email Defines the user e-mail.
 * @property {'admin' | 'appraiser' | 'student'} role Defines the user role.
 * @property {string} profileImages Defines an URL of the user profile image.
 * @property {Attempt[]} attempts Defines an array that keeps all previous quizzes attempts.
 * @property {string} created Defines an iso string of the user creation date.
 * @property {string} updated Defines an iso string of the user last edition date.
 */

/**
 * @typedef {{admin: boolean, appraiser: boolean, student: boolean}} UserClaims
 */

/**
 * @typedef {Object} UserState
 * @property {{id: string}|null} user The current user uid.
 * @property {UserInfo} userInfo The current user info.
 * @property {UserClaims} userClaims The current user claims.
 * @property {UserInfo[]} users An array of users.
 * @property {UserInfo} lastUser The most recent registered user.
 */

/**
 * Gets the initial state for sign user store.
 *
 * @returns {UserState} The initial user state object.
 */
const initialState = () => ({
  user: null,
  userInfo: null,
  userClaims: null,
  users: [],
  lastUser: null
});

const state = initialState();

const mutations = {
  /**
   * Sets the current user uid into the state.
   *
   * @param {UserState} state - The user state.
   * @param {string} data - The user uid.
   */
  setUser(state, data) {
    state.user = data;
  },
  /**
   * Sets the current user info into the state.
   *
   * @param {UserState} state - The user state.
   * @param {UserInfo} data - The user info.
   */
  setUserInfo(state, data) {
    state.userInfo = data;
  },
  /**
   * Sets the current user claims into the state.
   *
   * @param {UserState} state - The user state.
   * @param {UserClaims} data - The user claims.
   */
  setUserClaims(state, data) {
    state.userClaims = data;
  },
  /**
   * Sets an array of users into the state.
   *
   * @param {UserState} state - The user state.
   * @param {UserInfo[]} data - The array of users.
   */
  setUsers(state, data) {
    state.users = data;
  },
  /**
   * Sets the most recent registered user into the state.
   *
   * @param {UserState} state - The user state.
   * @param {UserInfo} data - The most recent user info.
   */
  setLastUser(state, data) {
    state.lastUser = data;
  },
  /**
   * Sets to a user a new role according to it's e-mail.
   *
   * @param {UserState} state - The user state.
   * @param {Object} data - The data containing the user e-mail and new role.
   * @param {string} data.email - The user e-mail.
   * @param {string} data.role - The user new role.
   */
  setUserRole(state, data) {
    const { email, role, updated } = data;
    const users = [];

    state.users.forEach(user => {
      if (user.email === email) {
        users.push({
          ...user,
          role,
          updated
        });
      } else {
        users.push(user);
      }
    });

    state.users = [...users];
  },
  /**
   * Resets the user state to it's initial state.
   *
   * @param {UserState} state - The user state.
   */
  RESETUsers(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key];
    });
  }
};

const actions = {
  /**
   * Signs an user in using its Google account.
   *
   * @param {Store<UserState>} store the vuex store.
   */
  async signWithGoogle({ commit }) {
    commit("setLoading", true);

    try {
      const user = await auth.signInWithPopup(googleProvider);

      if (!user.additionalUserInfo.isNewUser) {
        analytics.logEvent("login");

        await db
          .collection("users")
          .doc(user.user.uid)
          .update({ provider: "google" });
      }
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      const errorModel = showErrorMessage(
        "default",
        "",
        "Google sign error - " + error.message
      );

      commit("setError", { message: errorModel });

      if (error.code === "") createErrorLog("Google Sign", error.message);
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Uploads a new avatar image to the current user.
   *
   * @param {Store} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {File} payload.image The image to be uploaded.
   * @returns {string} The image url.
   */
  async uploadAvatar({ commit }, payload) {
    try {
      const storageRef = storage.ref();
      const file = payload.image;
      const name = "avatar";
      const subfolder = auth.currentUser.uid;
      const type = file.type.split("/")[1];
      const format = `users/${subfolder}/${name}.${type}`;

      const snapshot = await storageRef.child(format).put(file);

      const downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl.toString();
    } catch (error) {
      const errorModel = showErrorMessage(
        "connection",
        "",
        "Avatar upload error - " + error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("Avatar Upload", error.message, {
        payload
      });
    }
  },
  /**
   * Creates a new user account in Firebase Authentication.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.name the new user name.
   * @param {string} payload.email the new user email.
   * @param {string} payload.image the new user image url.
   * @param {string} payload.password the new user password.
   * @param {string} payload.userUid whether the user was created using a Google account.
   */
  async signUserUp({ commit, dispatch }, payload) {
    commit("setLoading", true);
    commit("clearError");

    try {
      let user = null;

      if (!payload.userUid) {
        user = await auth.createUserWithEmailAndPassword(
          payload.email,
          payload.password
        );
      }

      const newUser = {
        id: payload.userUid || user.user.uid
      };

      const createdAt = getNowISOString();

      const userInfo = {
        name: payload.name,
        email: payload.email,
        profileImages: payload.image || "",
        role: "student",
        attempts: [],
        provider: payload.userUid ? "google" : "password",
        created: createdAt,
        updated: createdAt
      };

      // let url = "";

      // if (process.env.NODE_ENV === "production") {
      //   url =
      //     "https://us-central1-cloud-quiz-generator.cloudfunctions.net/authentication-userDefaultRole";

      //   await axios.get(url, { headers: { uid: newUser.id } });
      // }

      await db
        .collection("users")
        .doc(newUser.id)
        .set(userInfo);

      analytics.logEvent("sign_up");

      const snap = await db.collection("data-size").get();
      const document = snap.docs[0];
      const size = +document.data().users;

      await document.ref.update({ users: size + 1 });

      commit("addRemoveSize", {
        key: "users",
        data: size + 1
      });

      await dispatch("loadUserClaims", true);
      commit("setUserInfo", { ...userInfo, id: newUser.id });
      commit("setUser", newUser);
    } catch (error) {
      const errorModel = showErrorMessage(
        "default",
        "",
        "Sign up error - " + error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("Sign Up", error.message, {
        email: payload.email
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Updates an user name and avatar image.
   *
   * @param {Store} store The vuex store.
   * @param {Object} payload The action payload.
   * @param {string} payload.name The user new name.
   * @param {string} payload.profileImages The user new avatar image.
   * @param {Attempt[]} payload.attempts The user quizzes attempts.
   * @param {boolean} payload.noMessage Whether the success message will be shown.
   */
  async updateUser({ commit, state }, payload) {
    commit("setLoading", true);

    const userInfo = {
      name: payload.name || state.userInfo.name,
      profileImages: payload.profileImages || state.userInfo.profileImages,
      attempts: payload.attempts || state.userInfo.attempts,
      updated: getNowISOString()
    };

    try {
      await db
        .collection("users")
        .doc(state.user.id)
        .update({
          ...userInfo
        });

      commit("setUserInfo", {
        ...userInfo,
        id: state.userInfo.id,
        email: state.userInfo.email,
        role: state.userInfo.role,
        created: state.userInfo.created
      });

      if (!payload.noMessage) {
        commit(
          "setSuccess",
          `'${userInfo.name || userInfo.email}' editado(a) com sucesso!`
        );
      }
    } catch (error) {
      const errorModel = showErrorMessage(
        "default",
        "",
        "User update error - " + error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("User DB Update", error.message, { payload });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Sign in the user using it's e-mail and password.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.email the user e-mail.
   * @param {string} payload.password the user password.
   */
  async signUserIn({ commit, dispatch }, payload) {
    commit("setLoading", true);
    commit("clearError");
    commit("clearSuccess");

    await dispatch("loadDataSize");

    dispatch("resetQuestions");
    dispatch("resetRequests");
    dispatch("resetTests");

    try {
      const userData = await dispatch("getUserByEmail", {
        email: payload.email
      });

      const googleSign = userData && userData.provider === "google";

      if (googleSign) {
        await auth.signInWithPopup(googleProvider);
      } else {
        await auth.signInWithEmailAndPassword(payload.email, payload.password);
      }

      analytics.logEvent("login");
    } catch (error) {
      const errorModel = showErrorMessage(
        "default",
        "",
        "Login error - " + error.message
      );

      commit("setError", { message: errorModel });

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        return;
      }

      createErrorLog("Login", error.message, {
        email: payload.email
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Loads the current user info base on it's uid.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.id The user uid.
   */
  async loadUserInfo({ commit }, payload) {
    commit("setLoading", true);

    const doc = await db
      .collection("users")
      .doc(payload.id)
      .get();

    commit("setUserInfo", { ...doc.data(), id: payload.id });
    commit("setLoading", false);
  },
  /**
   * Loads the current user claims.
   *
   * @param {Store} store the vuex store.
   * @param {boolean} payload whether is to apply the default role or not.
   * @returns {Promise<Object>} the user claims.
   */
  async loadUserClaims({ commit, state }, payload) {
    try {
      if (auth.currentUser && !state.userClaims) {
        const doc = await db
          .collection("users")
          .doc(auth.currentUser.uid)
          .get();

        const claims = {
          admin: false,
          appraiser: false,
          student: false
        };

        claims[payload ? "student" : doc.data().role] = true;

        commit("setUserClaims", claims);
        return claims;
      }

      return null;
    } catch (error) {
      const errorModel = showErrorMessage("load", "User Claims", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("User Claims Load", error.message, {
        currentUser: auth.currentUser
      });
    }
  },
  /**
   * Loads all the application users.
   *
   * @param {Store} store - The vuex store.
   */
  async loadUsers({ commit }) {
    commit("setLoading", true);

    const users = [];

    try {
      const snapshot = await db.collection("users").get();

      snapshot.forEach(doc => {
        users.push({ ...doc.data(), id: doc.id });
      });

      commit("setUsers", users);
    } catch (error) {
      const errorModel = showErrorMessage("load", "Usuários", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Users Load", error.message, { users });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Loads the most recent registered user.
   *
   * @param {Store} store - The vuex store.
   */
  async loadLastUser({ commit }) {
    commit("setLoading", true);

    try {
      const snapshot = await db
        .collection("users")
        .orderBy("created", "desc")
        .limit(1)
        .get();

      snapshot.forEach(doc => {
        commit("setLastUser", { ...doc.data(), id: doc.id });
      });
    } catch (error) {
      const errorModel = showErrorMessage("load", "Usuário", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("Last User Loading", error.message, { users });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Gets an user by its uid.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.id the user uid.
   * @returns {Promise<UserInfo>} an user data.
   */
  async getUserById({ commit }, payload) {
    commit("setLoading", true);

    const { id } = payload;

    try {
      const doc = await db
        .collection("users")
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      return { ...doc.data(), id };
    } catch (error) {
      const errorModel = showErrorMessage("load", "Usuário", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("User By Id Loading", error.message, {
        payload
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Gets an user by its e-mail.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the action payload.
   * @param {string} payload.email The user e-mail.
   * @returns {Promise<UserInfo>} an user data.
   */
  async getUserByEmail({ commit }, payload) {
    commit("setLoading", true);

    const { email } = payload;

    try {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      const doc = snapshot.docs[0];

      if (!doc) {
        return null;
      }

      return { ...doc.data(), id: doc.id };
    } catch (error) {
      const errorModel = showErrorMessage("load", "Usuário", error.message);

      commit("setError", { message: errorModel });
      createErrorLog("User By E-mail Loading", error.message, {
        payload
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Sets to an user a new role.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.email - The user e-email.
   * @param {string} payload.role - The user new role.
   */
  async setUserRole({ commit }, payload) {
    commit("setLoading", true);

    const { email, role } = payload;

    // let url = "";

    // if (process.env.NODE_ENV === "production") {
    //   url =
    //     "https://us-central1-cloud-quiz-generator.cloudfunctions.net/authentication-setRole";
    // }

    try {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      const doc = snapshot.docs[0];
      const updated = getNowISOString();

      await doc.ref.update({ role, updated });

      commit("setUserRole", { email, role, updated });

      // if (process.env.NODE_ENV === "production") {
      //   await axios.post(url, {
      //     data: {
      //       email,
      //       role
      //     }
      //   });
      // }

      commit(
        "setSuccess",
        `'${doc.data().name || email}' editado(a) com sucesso!`
      );
    } catch (error) {
      const errorModel = showErrorMessage(
        "edition",
        "Cargo de Usuário",
        error.message
      );

      commit("setError", { message: errorModel });
      createErrorLog("User Role Update", error.message, {
        payload,
        url,
        updated
      });
    } finally {
      commit("setLoading", false);
    }
  },
  /**
   * Logs out the current user.
   *
   * @param {Store} store - The vuex store.
   */
  async logout({ commit }) {
    await auth.signOut();
    commit("setUser", null);
    commit("setUserInfo", null);
    commit("setUserClaims", null);
  },
  /**
   * Auto sign in an user if it's id is already into the browser local storage.
   *
   * @param {Store} store the vuex store.
   * @param {Object} payload the user payload.
   */
  async autoSignIn({ commit, dispatch }, payload) {
    const user = await dispatch("getUserById", { id: payload.uid });

    analytics.setUserId(payload.uid);

    if (!user) {
      await dispatch("signUserUp", {
        name: payload.displayName,
        email: payload.email,
        image: payload.photoURL,
        userUid: payload.uid
      });

      return;
    }

    await dispatch("loadUserClaims");
    dispatch("loadUserInfo", { id: payload.uid });
    commit("setUser", { id: payload.uid });
  },
  /**
   * Resets the user password according to it's e-mail.
   *
   * @param {Store} store - The vuex store.
   * @param {Object} payload - The action payload.
   * @param {string} payload.email - The user e-mail.
   */
  resetPassword({ commit }, payload) {
    const { email } = payload;

    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        commit("setSuccess", `E-mail enviado para ${email}`);
      })
      .catch(error => {
        commit("setLoading", false);
        const errorModel = showErrorMessage(
          "admin",
          "",
          "Não foi possível enviar o e-mail para redefinir a senha."
        );
        commit("setError", { message: errorModel });
        createErrorLog("User Password Reset", error.message, {
          payload
        });
      });
  },
  /**
   * Resets the user state to it's initial state.
   *
   * @param {Store} store - The vuex store.
   */
  resetUsers({ commit }) {
    commit("RESETUsers");
  }
};

const getters = {
  /**
   * Gets the current user uid.
   *
   * @param {UserState} state - The user state.
   * @returns {{id: string}|null} The current user uid.
   */
  user(state) {
    return state.user;
  },
  /**
   * Gets the current user info.
   *
   * @param {UserState} state - The user state.
   * @returns {UserInfo} The current user info.
   */
  userInfo(state) {
    return state.userInfo;
  },
  /**
   * Gets an array of all application users.
   *
   * @param {UserState} state - The user state.
   * @returns {UserInfo[]} An array of users.
   */
  users(state) {
    return state.users;
  },
  /**
   * Gets the current user claims.
   *
   * @param {UserState} state - The user state.
   * @returns {UserClaims} The current user claims.
   */
  getUserClaims(state) {
    return state.userClaims;
  },
  /**
   * Gets the most recent registered user info.
   *
   * @param {UserState} state - The user state.
   * @returns {UserInfo} The last registered user info.
   */
  getLastUser(state) {
    return state.lastUser;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
