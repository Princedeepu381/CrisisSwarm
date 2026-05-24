@echo off
echo =======================================
echo 🧹 CrisisSwarm Repository Cleanup ^& Push
echo =======================================

echo.
echo 1. Removing untracked and unusual files...
if exist "trigger.txt" (
    git rm --cached "trigger.txt" 2>nul
    del "trigger.txt"
    echo   Deleted trigger.txt
)
if exist "tsconfig.tsbuildinfo" (
    git rm --cached "tsconfig.tsbuildinfo" 2>nul
    del "tsconfig.tsbuildinfo"
    echo   Deleted tsconfig.tsbuildinfo
)
if exist "prisma\crisisswarm.db" (
    git rm --cached "prisma\crisisswarm.db" 2>nul
    del "prisma\crisisswarm.db"
    echo   Deleted prisma\crisisswarm.db
)

echo.
echo 2. Stage changes (including updated .gitignore)...
git add .gitignore README.md SECURITY.md pitch-deck.md

echo.
echo 3. Committing clean repository state...
git commit -m "chore: clean up build cache, database, and temporary files"

echo.
echo 4. Pushing to GitHub...
git push origin main

echo.
echo =======================================
echo ✅ Done! GitHub repository is clean and updated.
echo =======================================
pause
