# ecommerce backend
RESTful API for e-commerce MVP using Node.js, Express and MongoDB and jwt authentication. 

[live app](https://freekvandam.nl/ecom) - 
[frontend repo](https://github.com/fvd2/ecommerce-frontend)

## Functionality
* User management: create account, sign in and change account information
* Products: view products and categories
* Cart: add and remove products, change quantity
* Checkout: enter shipping information, create test payment (via Mollie.com integration) and view order confirmation (status based on provided test payment status, through a webhook called by Mollie)

## Even better if: main ideas for additions and further improvements
* Sign-in: improve email authentication - token-based email confirmation after registering and updating e-mail address
* Sign-in: add social sign-in
* Account: add order history
* Users: implement scopes
* ...
