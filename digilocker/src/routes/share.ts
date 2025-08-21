import { Router } from 'express';
import { db } from '../db';
import dayjs from 'dayjs';

const router = Router();

router.get('/:token', (req, res) => {
  const { token } = req.params;
  const link = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token) as any;
  if (!link) return res.status(404).send('Invalid link');
  if (link.expires_at && dayjs(link.expires_at).isBefore(dayjs())) {
    return res.status(410).send('Link expired');
  }
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(link.certificate_id) as any;
  if (!cert) return res.status(404).send('Certificate not found');
  res.render('share', { cert });
});

export default router;

