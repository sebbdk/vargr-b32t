# B32T Backup

Simple backup GUI that can distribute backups to Samba shares,
Meant for server backup in a home setting.

**Use a reverse proxy with authentication or private network, this application does not come with authentication.**

Go to your host at port 3000 and configure your samba credentials and other settings.

If you are using this with docker, mount the folder to be back up to ´/home/node/app/data/from´
You can also persist the credentials/configs by mounting ´/home/node/app/data/config´.

## Preview

![image](https://user-images.githubusercontent.com/870110/84577175-4288b800-adba-11ea-82a1-27df3d11c7db.png)

## Usage

Runs as nodejs process by running `npm run start` or `yarn run start`.

Build the docker container by running `docker run`.

Build the docker image locally by running `docker build -t cnstruct/b32t .`.

Run the docker image locally by running `docker run --rm -p 3000:3000 cnstruct/b32t` it removes the image after is stops.

Run the docker image and enter it via sh for debugging: `docker run --rm -i -p 3000:3000 cnstruct/b32t:latest sh`.

If your HD is filling up run this command to purge docker data `docker system prune -a`.

## Upcoming features

- Recover from backup
  - Could conflict with other running containers and file permissions.
- Add schedule backups at 00:00 option
- Use .tar.gz for archives
- Retry transfer later if remote was not available at transfer time
- Add Option to keep only one daily, weekly and monthly backup.
- Archive transfer progress
- Multiple remotes
- rsync diff based syncronization
- Space available feedback
- Notifications on error, or jsut status, email, mobile, push.

## R&D Questions

- Use .tar.gz for cross file compression? (https://www.brendanlong.com/zip-vs-tar-for-compressed-archives.html) (and https://stackoverflow.com/questions/10540935/what-is-the-difference-between-tar-and-zip)
