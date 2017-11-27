## Nu-Forum

If there's anything you need in life, it's another Forum software. This is Nu-Forum, both the Front-End and Back-End written in ReactJS and Python Django. With Nu-Forum you can create your own community discussion board. You and your guests will be able to create threads and comments. Probably the most important part about Nu-Forum is the nested comments system, where you can nest comment after comment after comment and so on. It's Great!

## Demo
[Otakurist](https://otakurist.com)

## Requirements
 * NodeJS/NPM
 * Python 3.x
 * Django
 * MariaDB

## Getting Started
To quickly get started, fork this repo and clone it onto your local computer. Then install all of the necessary libraries.
```
git clone https://github.com/Technopathic/Nu-Forum.git
cd Nu-Forum
npm install
pip install -r requirements.txt
```

Be sure to create your Database and add it to the settings.py file, then you can run ``` python manage.py migrate ``` to create the tables from the models.py file.
From there you can run the development servers and you'll be all set to customize Nu-Forum to your liking.
```
python manage.py runserver
npm run start
```

When you are ready to deploy your Nu-Forum, be sure to update all of your API links from using 127.0.0.1 to your own domain name.

## License
MIT
