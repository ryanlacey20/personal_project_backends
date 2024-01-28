// server.js
const express = require('express');
const { post } = require('axios');
const { json } = require('body-parser');

const app = express();
app.use(json());

const secretKey = process.env.CAPTCHA_SECRET_KEY;

app.post('/api/verify-recaptcha', async (req, res) => {
    const recaptchaResponse = req.body.recaptchaResponse;
    try {
        const verificationResult = await post('https://www.google.com/recaptcha/api/siteverify', {
            secret: secretKey,
            response: recaptchaResponse,
        });

        if (verificationResult.data.success) {
            // Verified, serve the contact details
            res.json({
                success: true,
                contactDetails: {
                    email: 'your@email.com',
                    linkedin: 'https://www.linkedin.com/in/yourusername/',
                    github: 'https://github.com/yourusername',
                },
            });
        } else {
            // Verification has failed
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
