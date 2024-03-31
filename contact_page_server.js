//contact_page_server.js
const express = require('express');
const cors = require('cors');
const { json } = require('body-parser');
const qs = require('querystring');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(json());
app.use(cors());

const secretKey = process.env.CAPTCHA_SECRET_KEY;
const email = process.env.EMAIL;
const phoneNumber = process.env.PHONENUMBER


app.post('/api/verify-recaptcha', async (req, res) => {
    const recaptchaResponse = req.body.recaptchaResponse;
    console.log("rekky", recaptchaResponse);
    try {
        const params = new URLSearchParams({
            secret: "6LcMi1UpAAAAANvYEz_l4pBKcxxmY-NLB4IQZGDt",
            response: recaptchaResponse,
        });

        fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: params,
        })
            .then(result => result.json())
            .then(data => {
                if (data.success) {
                    // Verified, serve the contact details
                    res.json({
                        success: true,
                        contactDetails: {
                            phoneNumber: phoneNumber,
                            email: email,
                            linkedin: "https://www.linkedin.com/in/ryanapatricklacey/",
                            github: "https://github.com/ryanlacey20",
                        },
                    });
                } else if (recaptchaResponse == "test") {
                    // Verification has failed
                    res.json({ success: "test" });
                } else {
                    // Verification has failed
                    res.json({ success: false, print: recaptchaResponse });
                }
            });
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        res.status(500).json({ errorstat: true, errormsg: error, success: false });
    }
});

const PORT1 = process.env.PORT1 || 3000;
app.listen(PORT1, () => {
    console.log(`Server is running on port ${PORT1}`);
});
