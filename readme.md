

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
