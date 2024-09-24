# Backend endpoint repository.  
Intended to be used for to host endpoints for multiple projects in the long run. Ideally these woud be in individual repos however for cost effectiveness they will be bundled here.  

## Endpoint 1: Google Cloud Tools: Re-capthca Verification
Recieves a token from the [resume_website](https://github.com/ryanlacey20/resume_website) front end.  
This token is processed and passed to the Google Cloud Tools re-captcha API for verification and the response is then passed back to the front end to determine whether the sensitive content will be revealed.
