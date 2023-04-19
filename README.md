# FEATURE LIST [/<3]
- refresh data query cache when modify title operation is successful
- make note edit field working
- implement analytics page (most visited location, most photos taken on which day, favourite day of the week to hang out, most travelled day)
- beautify notification pop out (when new notification disrupts the old one, there is no pop effect)
- design settings page
- see if its possible to trim item-zoom to remove .hidden class since base class can take left: 100%
- search function to search with headers (collection: ..., date: ..., title: ...., note: ....)
- work on frontend for customising day-container
- add padding to notification

# IN PROGRESS
- contextactionmenu upon right click/long hold
- reactions to images
- extend cookies to persist between browser sessions
https://github.com/jmadler/emoji-picker/blob/main/lib/js/config.js

# BUG CHECK
- does saving title edit saves the current input field even if a new view was pulled up
- see how to extract local date month, year and day (data saving for day container customisation reference)
	- done by saving the day, month, and year (and going back to branches in .sortedTree)

# IMPLEMENTED
- edit success status shows as notifications
- have server 'semi-hydrate' html file (for unauthenticated/authenticated users to remove lock screen)
- add swipe gestures for side bar
- customisable background for each day-container
- add localised settings margin (to differentiate between global and local settings in settings page)
- add side bar (similar to instagram)
- fix sorting bug
- work on user profile (login codes)
- show both timings for close up view
- create create page (work on manual input date when images set failed to go through)
- remove legacy upload button
- clear database (and push to production)
- add heart favicon
- look into exifr returning local date for exif data regardless of machine
- look into multiple file uploads (when one file fails etc)
- remove trailing spaces for input (title on upload - do this client side only)
- reinforced upload button and createPageContainer logic to prevent double submissions or any data spills (edit form gets cleaned up)
- include camera make in datastore
- catch on scheduler may not remove all references in hearts.json (or anywhere else - pls check)
- lock icon upon hover on dates (to indicate the data is locked)


# BLOG IDEAS
- 10 online co-op chill co-op games
- beginners' guide to rocket league


# software ideas
- money overview (the budget companion)
	- with features such as 'can i make this purchase', 'budget limiting (set wallet's balance for the month)'