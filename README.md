# After create an app in heroku run the next commands

1. `heroku login`
2. `git init`
3. `heroku git:remote -a <NAME OF THE HEROKU APP>`
4. `git add .`
5. `git commit -am "make it better"`
6. `git push heroku master`

## Troubleshooting Node.js Deploys

Run this command if exist some error when deploying on heroku

7. `heroku buildpacks`

https://devcenter.heroku.com/articles/troubleshooting-node-deploys