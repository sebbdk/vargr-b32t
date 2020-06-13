
# B32T Backup
Simple backup GUI that can distribute backups to Samba shares,
Mean for server backup in a home setting. 

## Preview
![image](https://user-images.githubusercontent.com/870110/83979889-ec2afd80-a911-11ea-9eb8-47917e01e071.png)

# Upcoming features
 - Recover from backup
   - Could conflict with other running containers and file permissions.
 - Auto run backups at 00:00
 - Use .tar.gz for archives
 - Retry transfer later if remote was not available at transfer time
 - Add Option to keep only one daily, weekly and monthly backup.
 - Archive transfer progress

# Questions
 * Use .tar.gz for cross file compression? (https://www.brendanlong.com/zip-vs-tar-for-compressed-archives.html) (and https://stackoverflow.com/questions/10540935/what-is-the-difference-between-tar-and-zip)





# todo:
 * API methods
   * Configure
   * Index, connect and see list backups
   * Move initiate backup
 * Service
   * Samba move
   * Schedule backups
   * Delete old backups
 * Document project













* Docker image or backups
    * Pick a folder
    * Add samba share to send stuff to
    * Backup now
    * See status on last backup run
    * Keep 3 backups on samba share
    * Expanded features:
        * Multiple endpoints / configurations
        * Check backup integrity (rsync —ignore-times)
        * Configure amount of backups kept
        * Backup compression
        * Schedule when
            * Handle intermittent share availability
            * Status on last backup
        * Status on space available
        * Background rsync with compression deadli





Would be nice to have my own docker registry for testing & deploying this
Consider looing at the template in portainer, and having that added to our docker compose

Might need to fiddle some kind of easy redeploy and CI build after, but the hub is a nice start.





Most zip libraries either only sync select files, or do not have progress feedback...


archiverjs seems the most grown up library
https://www.archiverjs.com/
