Docker Stack for Pinakes
========================

based on https://medium.com/@mkt_43322/how-to-setup-docker-for-a-symfony-project-26d304359592

- Install Docker
- Create symfony directory here and place the pinakes symfony source here. Either manually or via SVN
- Edit symfony/web/app_dev.php and remove the "if (isset($_SERVER['HTTP_CLIENT_IP'])" block.
- Create the directory symfony/web/tmp
- Copy a MySQL dump into mysqldata. This can be deleted after the first run as the mysql files will be saved to the mysql folder
- Change the db host name in parameters.yml to "db".
- Start docker with "docker-compose up". The first start will take a while beacuse the db needs to be populated from the dump. This is usually indicated by "MySQL starting process 1"
- Connect to server in browser using "http://localhost:81"


