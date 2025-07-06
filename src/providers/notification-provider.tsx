import { PropsWithChildren, useState, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import registerForPushNotificationsAsync from "../lib/notifications";
import { useAuth } from "./auth-provider";
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@env';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationProvider = ({ children }: PropsWithChildren) => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const { user } = useAuth();

    const saveUserPushNotificationToken = async (token: string) => {
      if (!token.length) return;

      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        console.log('Hey there: ', user);
        const response = await fetch(`${API_URL}/users/${user.id}/save-notification-token/`, {
          method: 'PATCH', // or 'POST' depending on your backend
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            expo_notification_token: token,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Failed to update push token');
        }

        console.log('✅ Push notification token saved successfully');
      } catch (error) {
        console.error('❌ Failed to save push notification token:', error.message);
      }


    }

    useEffect(() => {
      registerForPushNotificationsAsync()
        .then(token => {
          setExpoPushToken(token ?? '');
        })
        .catch((error: any) => setExpoPushToken(`${error}`));

      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }, []);

    useEffect(() => {
      if (expoPushToken && user?.id) {
        saveUserPushNotificationToken(expoPushToken);
      }
    }, [expoPushToken, user?.id]);
    return <>{children}</>;
}

export default NotificationProvider;