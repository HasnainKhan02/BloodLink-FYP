import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'bloodlink_reverb_key',
  wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const token = localStorage.getItem('bloodlink_token');
        fetch('http://127.0.0.1:8000/api/broadcasting/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((response) => response.json())
          .then((data) => callback(false, data))
          .catch((error) => callback(true, error));
      },
    };
  },
});

export default echo;