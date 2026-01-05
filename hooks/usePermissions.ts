import { requestPermissionsAsync, showNotification } from "@/hooks/useNotification";
import { useEffect } from "react";

export const usePermissions = () => {
    useEffect(() => {
    async function askPermissions() {
      try {
        const granted = await requestPermissionsAsync();
        if (!granted) { console.warn("Notifications permission not granted"); }
        else { console.log("Notifications permission granted"); }
      } catch (err) { console.error("Error requesting notifications permission:", err); }
    }

    showNotification("Welcome", "Welcome to Ciculus App");
    console.log("Permissions hook executed");
    askPermissions();
  }, []);
}
