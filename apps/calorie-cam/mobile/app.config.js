import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "your-eas-project-id",
      },
    },
  };
};
