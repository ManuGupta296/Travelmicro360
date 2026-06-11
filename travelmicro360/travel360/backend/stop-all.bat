@echo off
echo Stopping all Travel360 services...
taskkill /FI "WindowTitle eq Config*" /T /F
taskkill /FI "WindowTitle eq Eureka*" /T /F
taskkill /FI "WindowTitle eq Auth*" /T /F
taskkill /FI "WindowTitle eq Inventory*" /T /F
taskkill /FI "WindowTitle eq Customer*" /T /F
taskkill /FI "WindowTitle eq Notification*" /T /F
taskkill /FI "WindowTitle eq Compliance*" /T /F
taskkill /FI "WindowTitle eq Payment*" /T /F
taskkill /FI "WindowTitle eq Booking*" /T /F
taskkill /FI "WindowTitle eq Gateway*" /T /F
echo Done.
pause
