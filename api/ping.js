import { createServerlessApp } from '../src/createServerlessApp.js';

export default createServerlessApp((app) => {
  app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'pong' });
  });
});
