const express = require('express');
const router = express.Router();

router.get('/check-env', (req, res) => {
  const key = process.env.DEEPSEEK_API_KEY || '';
  res.json({
    hasKey: key.length > 0,
    keyPrefix: key.substring(0, Math.min(10, key.length)),
    keyLength: key.length,
    nodeEnv: process.env.NODE_ENV || 'not set',
    allVars: Object.keys(process.env).filter(k => k.includes('DEEP') || k.includes('API') || k.includes('KEY'))
  });
});

module.exports = router;
