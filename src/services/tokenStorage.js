import localforage from 'localforage';
import Cookies from 'js-cookie';

// Configure localForage
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: 'AahwahanAdminApp',
  version: 1.0,
  storeName: 'auth_tokens'
});

class TokenStorage {
  constructor() {
    this.TOKEN_KEY = 'admin_token';
    this.USER_KEY = 'admin_user';
    this.COOKIE_EXPIRES = 7; // 7 days

    // Initialize localForage with custom config
    this.storage = localforage.createInstance({
      name: 'AahwahanAdminApp',
      storeName: 'auth_storage'
    });
  }

  /**
   * Save token to multiple storage locations for redundancy
   * @param {string} token - JWT token
   * @param {object} user - User object
   */
  async saveToken(token, user = null) {
    const savePromises = [];

    try {
      // 1. Save to cookies (primary)
      Cookies.set(this.TOKEN_KEY, token, {
        expires: this.COOKIE_EXPIRES,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });

      // 2. Save to localForage (IndexedDB/WebSQL/localStorage fallback)
      savePromises.push(this.storage.setItem(this.TOKEN_KEY, token));

      // 3. Save to sessionStorage as backup
      if (window.sessionStorage) {
        window.sessionStorage.setItem(this.TOKEN_KEY, token);
      }

      // 4. Save to localStorage as additional backup
      if (window.localStorage) {
        window.localStorage.setItem(this.TOKEN_KEY, token);
      }

      // Save user data if provided
      if (user) {
        // Save user to cookies
        Cookies.set(this.USER_KEY, JSON.stringify(user), {
          expires: this.COOKIE_EXPIRES,
          secure: window.location.protocol === 'https:',
          sameSite: 'strict'
        });

        // Save user to localForage
        savePromises.push(this.storage.setItem(this.USER_KEY, user));

        // Save user to session and local storage
        if (window.sessionStorage) {
          window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        if (window.localStorage) {
          window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      }

      // Wait for all async operations to complete
      await Promise.all(savePromises);

      console.log('✅ Token saved successfully to all storage locations');
      return true;
    } catch (error) {
      console.error('❌ Error saving token:', error);
      return false;
    }
  }

  /**
   * Get token from storage with fallback mechanism
   * @returns {string|null} Token if found, null otherwise
   */
  async getToken() {
    try {
      // 1. Try cookies first (most reliable for SSR)
      let token = Cookies.get(this.TOKEN_KEY);
      if (token) {
        console.log('🍪 Token retrieved from cookies');
        return token;
      }

      // 2. Try localForage (IndexedDB/WebSQL/localStorage)
      token = await this.storage.getItem(this.TOKEN_KEY);
      if (token) {
        console.log('💾 Token retrieved from localForage');
        // Restore to cookies if missing
        Cookies.set(this.TOKEN_KEY, token, { expires: this.COOKIE_EXPIRES });
        return token;
      }

      // 3. Try sessionStorage
      if (window.sessionStorage) {
        token = window.sessionStorage.getItem(this.TOKEN_KEY);
        if (token) {
          console.log('📝 Token retrieved from sessionStorage');
          // Restore to primary storage
          await this.saveToken(token);
          return token;
        }
      }

      // 4. Try localStorage as last resort
      if (window.localStorage) {
        token = window.localStorage.getItem(this.TOKEN_KEY);
        if (token) {
          console.log('💽 Token retrieved from localStorage');
          // Restore to primary storage
          await this.saveToken(token);
          return token;
        }
      }

      console.log('❌ No token found in any storage location');
      return null;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Get user data from storage with fallback mechanism
   * @returns {object|null} User object if found, null otherwise
   */
  async getUser() {
    try {
      // 1. Try cookies first
      let userStr = Cookies.get(this.USER_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('🍪 User retrieved from cookies');
          return user;
        } catch (parseError) {
          console.warn('Failed to parse user from cookies:', parseError);
        }
      }

      // 2. Try localForage
      let user = await this.storage.getItem(this.USER_KEY);
      if (user) {
        console.log('💾 User retrieved from localForage');
        // Restore to cookies if missing
        Cookies.set(this.USER_KEY, JSON.stringify(user), { expires: this.COOKIE_EXPIRES });
        return user;
      }

      // 3. Try sessionStorage
      if (window.sessionStorage) {
        userStr = window.sessionStorage.getItem(this.USER_KEY);
        if (userStr) {
          try {
            user = JSON.parse(userStr);
            console.log('📝 User retrieved from sessionStorage');
            // Restore to primary storage
            await this.saveToken(await this.getToken(), user);
            return user;
          } catch (parseError) {
            console.warn('Failed to parse user from sessionStorage:', parseError);
          }
        }
      }

      // 4. Try localStorage
      if (window.localStorage) {
        userStr = window.localStorage.getItem(this.USER_KEY);
        if (userStr) {
          try {
            user = JSON.parse(userStr);
            console.log('💽 User retrieved from localStorage');
            // Restore to primary storage
            await this.saveToken(await this.getToken(), user);
            return user;
          } catch (parseError) {
            console.warn('Failed to parse user from localStorage:', parseError);
          }
        }
      }

      console.log('❌ No user data found in any storage location');
      return null;
    } catch (error) {
      console.error('❌ Error retrieving user:', error);
      return null;
    }
  }

  /**
   * Clear all tokens and user data from all storage locations
   */
  async clearAll() {
    const clearPromises = [];

    try {
      // 1. Clear cookies
      Cookies.remove(this.TOKEN_KEY);
      Cookies.remove(this.USER_KEY);

      // 2. Clear localForage
      clearPromises.push(this.storage.removeItem(this.TOKEN_KEY));
      clearPromises.push(this.storage.removeItem(this.USER_KEY));

      // 3. Clear sessionStorage
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(this.TOKEN_KEY);
        window.sessionStorage.removeItem(this.USER_KEY);
      }

      // 4. Clear localStorage
      if (window.localStorage) {
        window.localStorage.removeItem(this.TOKEN_KEY);
        window.localStorage.removeItem(this.USER_KEY);
      }

      // Wait for all async operations to complete
      await Promise.all(clearPromises);

      console.log('🧹 All tokens and user data cleared from all storage locations');
      return true;
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Check if we have a valid token in any storage location
   * @returns {boolean} True if token exists, false otherwise
   */
  async hasToken() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Get storage health status for debugging
   * @returns {object} Status of each storage mechanism
   */
  async getStorageStatus() {
    const status = {
      cookies: {
        token: !!Cookies.get(this.TOKEN_KEY),
        user: !!Cookies.get(this.USER_KEY)
      },
      localForage: {
        token: !!(await this.storage.getItem(this.TOKEN_KEY)),
        user: !!(await this.storage.getItem(this.USER_KEY))
      },
      sessionStorage: {
        available: !!window.sessionStorage,
        token: !!(window.sessionStorage && window.sessionStorage.getItem(this.TOKEN_KEY)),
        user: !!(window.sessionStorage && window.sessionStorage.getItem(this.USER_KEY))
      },
      localStorage: {
        available: !!window.localStorage,
        token: !!(window.localStorage && window.localStorage.getItem(this.TOKEN_KEY)),
        user: !!(window.localStorage && window.localStorage.getItem(this.USER_KEY))
      }
    };

    console.log('📊 Storage Status:', status);
    return status;
  }

  /**
   * Sync data across all storage mechanisms
   */
  async syncStorage() {
    try {
      const token = await this.getToken();
      const user = await this.getUser();

      if (token) {
        await this.saveToken(token, user);
        console.log('🔄 Storage synchronized successfully');
      }
    } catch (error) {
      console.error('❌ Error syncing storage:', error);
    }
  }
}

// Create and export singleton instance
const tokenStorage = new TokenStorage();
export default tokenStorage;