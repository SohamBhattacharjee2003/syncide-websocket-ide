const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("syncide_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// ========== AUTH API ==========
export const authAPI = {
  register: async (userData) => {
    const data = await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem("syncide_token", data.token);
      localStorage.setItem("syncide_user", JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials) => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem("syncide_token", data.token);
      localStorage.setItem("syncide_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout: async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (error) {
      // Continue with logout even if API fails
      console.log("Logout API call failed, clearing local storage");
    }
    localStorage.removeItem("syncide_token");
    localStorage.removeItem("syncide_user");
    localStorage.removeItem("syncide_workspaces");
  },

  getMe: async () => {
    return fetchApi("/auth/me");
  },

  updateProfile: async (profileData) => {
    const data = await fetchApi("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    if (data.user) {
      localStorage.setItem("syncide_user", JSON.stringify(data.user));
    }
    return data;
  },

  updatePassword: async (passwordData) => {
    return fetchApi("/auth/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },
};

// ========== WORKSPACE API ==========
export const workspaceAPI = {
  getAll: async () => {
    return fetchApi("/workspaces");
  },

  getOne: async (id) => {
    return fetchApi(`/workspaces/${id}`);
  },

  create: async (workspaceData) => {
    return fetchApi("/workspaces", {
      method: "POST",
      body: JSON.stringify(workspaceData),
    });
  },

  update: async (id, workspaceData) => {
    return fetchApi(`/workspaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(workspaceData),
    });
  },

  delete: async (id) => {
    return fetchApi(`/workspaces/${id}`, {
      method: "DELETE",
    });
  },

  toggleStar: async (id) => {
    return fetchApi(`/workspaces/${id}/star`, {
      method: "PUT",
    });
  },

  addCollaborator: async (id, collaboratorData) => {
    return fetchApi(`/workspaces/${id}/collaborators`, {
      method: "POST",
      body: JSON.stringify(collaboratorData),
    });
  },
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getStats: async () => {
    return fetchApi("/dashboard/stats");
  },

  getWeeklyActivity: async () => {
    return fetchApi("/dashboard/activity");
  },

  getLanguages: async () => {
    return fetchApi("/dashboard/languages");
  },

  getActivities: async (limit = 20, page = 1) => {
    return fetchApi(`/dashboard/activities?limit=${limit}&page=${page}`);
  },

  createActivity: async (activityData) => {
    return fetchApi("/dashboard/activities", {
      method: "POST",
      body: JSON.stringify(activityData),
    });
  },
};

// ========== CODE EXECUTION API ==========
export const executeAPI = {
  run: async (code, language) => {
    const response = await fetch(`${API_URL.replace("/api", "")}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    return response.json();
  },
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("syncide_token");
  const user = localStorage.getItem("syncide_user");
  return !!(token && user);
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("syncide_user");
  return user ? JSON.parse(user) : null;
};

export default {
  auth: authAPI,
  workspace: workspaceAPI,
  dashboard: dashboardAPI,
  execute: executeAPI,
  isAuthenticated,
  getCurrentUser,
};
